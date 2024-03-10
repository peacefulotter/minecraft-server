import path from 'path'
import Long from 'long'
import * as NBT from 'nbtify'

import {
    BlockPalettedContainerFormat,
    DataStructure,
    type ChunkSection,
} from './type'
import { PacketBuffer } from '~/net/PacketBuffer'
import type { Chunk, Section } from '../../Region-Types/src/java'
import { EMPTY_CHUNK, biome } from './chunk'
import { DB } from '~/db'
import './fix-stream'
import { log } from '~/logger'

const CHUNK_SECTIONS = 1024 as const
const CHUNK_DATA_LENGTH = CHUNK_SECTIONS * 4

type EncodedChunkPosition = `${number},${number}`
type ChunkColumn = PacketBuffer
type ChunkMap = Map<EncodedChunkPosition, ChunkColumn>
type LightMap = Map<EncodedChunkPosition, PacketBuffer[]>

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
        return lights || []
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

        const skyLights = PacketBuffer.from(
            s ? new Uint8Array(s.SkyLight) : ([] as number[])
        )
        return { section, skyLights }
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
            const lights: PacketBuffer[] = []
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
            this.skyLights.set(key, lights)
        }
    }
}
