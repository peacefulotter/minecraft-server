import type { Entity, EntityId } from '.'
import type { Player } from './entities/player'

export class EntityHandler {
    entities: Record<EntityId, Entity> = {}
    players: Record<EntityId, Player> = {}

    addEntity(entity: Entity) {
        this.entities[entity.entityId] = entity
    }

    addPlayer(player: Player) {
        this.addEntity(player)
        this.players[player.entityId] = player
    }

    removeEntity(entity: Entity) {
        const removed = entity.entityId in this.entities
        delete this.entities[entity.entityId]
        return removed
    }

    removePlayer(player: Player) {
        this.removeEntity(player)
        const removed = player.entityId in this.players
        delete this.players[player.entityId]
        return removed
    }

    getAll() {
        return Object.values(this.entities)
    }

    getPlayers() {
        return Object.values(this.players)
    }
}
