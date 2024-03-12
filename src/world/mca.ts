import path from 'path'
import Long from 'long'
import BitSet from 'bitset'
import * as NBT from 'nbtify'

import {
    BlockPalettedContainerFormat,
    DataStructure,
    type ChunkSection,
} from './type'
import { PacketBuffer } from '~/net/PacketBuffer'
import type { Chunk, Section } from '../../Region-Types/src/java'
import { EMPTY_CHUNK, biome } from './chunk'
import { log } from '~/logger'
import { DB } from '~/db'
import './fix-stream'

const CHUNK_SECTIONS = 1024 as const
const CHUNK_DATA_LENGTH = CHUNK_SECTIONS * 4

type EncodedChunkPosition = `${number},${number}`

type ChunkColumn = PacketBuffer
type ChunkMap = Map<EncodedChunkPosition, ChunkColumn>

type Light = Buffer | { full: true } | { empty: true }
type LightColumn = {
    lightMask: BitSet
    emptyLightMask: BitSet
    fullLightMask: BitSet
    lights: PacketBuffer[]
}
type LightMap = Map<EncodedChunkPosition, LightColumn>

export class World {
    private readonly chunks: ChunkMap = new Map()
    private readonly skyLights: LightMap = new Map()

    private readonly chunkType = new DataStructure()

    constructor(files: string[]) {
        this.loadRegions(files)
    }

    async loadRegions(files: string[]) {
        const buffers = await Promise.all(
            files.map(async (f) => {
                const p = path.join(import.meta.dir, 'region', f)
                return await Bun.file(p).arrayBuffer()
            })
        )
        await Promise.all(buffers.map((b) => this.parseRegion(b)))
        log('Loaded', this.chunks.size, 'chunks')
    }

    private getKey(x: number, z: number): EncodedChunkPosition {
        return `${x},${z}`
    }

    getChunk(x: number, z: number) {
        const chunk = this.chunks.get(this.getKey(x, z))
        return chunk || PacketBuffer.from(EMPTY_CHUNK)
    }

    getLights(x: number, z: number) {
        const lights = this.skyLights.get(this.getKey(x, z))
        return (
            lights || {
                lightMask: new BitSet(0),
                emptyLightMask: new BitSet(0),
                fullLightMask: new BitSet(0),
                lights: [],
            }
        )
    }

    private getCorrectBpe<R extends { [key: number]: any }>(
        bpe: number,
        ranges: R
    ): keyof R {
        if (bpe < 0) return 0

        const max = Math.max(...Object.keys(ranges).map(Number))
        if (bpe > max) return max

        while (!(bpe in ranges)) {
            bpe++
        }

        return bpe
    }

    private async getSection(s: Section) {
        const { palette, data } = s.block_states

        const bpe = Math.ceil(Math.log2(palette.length))

        // TODO: for proper state, use blocks and palette properties
        const paletteIds = palette.map(
            (p) =>
                DB.block_name_to_default_state_id[
                    p.Name as keyof typeof DB.block_name_to_default_state_id
                ]
        )

        // TODO: avoid unecessary conversion
        const dataLongs = [...(data || [])].map((n) =>
            Long.fromString(n.toString())
        )

        const section: ChunkSection = {
            blockCount: 256,
            blockStates: {
                bpe: this.getCorrectBpe(bpe, BlockPalettedContainerFormat),
                palette: paletteIds as any,
                data: dataLongs,
            },
            biomes: {
                bpe: 0,
                palette: biome,
                data: [],
            },
        }

        const skyLights: Light =
            s.SkyLight === undefined || s.SkyLight.length === 0
                ? { empty: true }
                : s.SkyLight.every((n) => n === 0xff)
                ? { full: true }
                : Buffer.from(new Uint8Array(s.SkyLight))

        return { section, skyLights }
    }

    private formatLights(lights: Light[]) {
        const lightMask = new BitSet(0)
        const fullLightMask = new BitSet(0)
        const emptyLightMask = new BitSet(0)
        const lightsBuffer: PacketBuffer[] = []

        for (let i = 0; i < lights.length; i++) {
            const light = lights[i]
            if ('full' in light) {
                fullLightMask.set(i, 1)
                // Register full light but store it as empty,
                // it will be replaced by a buffer full of ones once the corresponding chunk is requested
                lightMask.set(i, 1)
                lightsBuffer.push(PacketBuffer.from([]))
            } else if ('empty' in light) {
                emptyLightMask.set(i, 1)
            } else {
                lightMask.set(i, 1)
                const buffer = PacketBuffer.from(light)
                lightsBuffer.push(buffer)
            }
        }

        return {
            lightMask,
            emptyLightMask,
            fullLightMask,
            lights: lightsBuffer,
        }
    }

    private async parseRegion(buffer: ArrayBuffer) {
        const reader = new PacketBuffer(Buffer.from(buffer))
        const locations = new Array(CHUNK_SECTIONS).fill(0).map((_, i) => {
            const loc = reader.readInt()
            return {
                offset: (loc >> 8) * CHUNK_DATA_LENGTH,
                sector: (loc & 0xff) * CHUNK_DATA_LENGTH,
            }
        })

        const timestamps = new Array(CHUNK_DATA_LENGTH)
            .fill(0)
            .map(() => reader.readInt())

        for (const { offset } of locations) {
            if (offset === 0) continue

            reader.readOffset = offset
            const length = reader.readInt()
            const compressionType = reader.readUnsignedByte()

            const rest = reader.readSlice(length)
            const nbt = await NBT.read<Chunk>(rest)
            const { xPos: x, yPos: y, zPos: z, sections } = nbt.data

            const chunk: ChunkSection[] = []
            const lights: Light[] = []
            for (let i = 0; i < sections.length; i++) {
                const { section, skyLights } = await this.getSection(
                    sections[i]
                )
                chunk.push(section)
                lights.push(skyLights)
            }

            const key = this.getKey(
                x as unknown as number,
                z as unknown as number
            )
            this.chunks.set(key, await this.chunkType.write(chunk))
            this.skyLights.set(key, this.formatLights(lights))
        }
    }
}
