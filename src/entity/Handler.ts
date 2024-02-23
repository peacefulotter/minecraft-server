import type { Entity, EntityId } from './entity'
import type { Player } from './player'

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

    getAll() {
        return Object.values(this.entities)
    }

    getPlayers() {
        return Object.values(this.players)
    }
}
