// Handles the entities.
const ENTITY_PHASES = {
    learning: "ent_learning",
    trading: "ent_trading",
    consuming: "ent_consuming",
    producing: "ent_producing"
}
const ENTITY_LIST = []
var ENTITY_COUNT = 0

function Entity(name, food, delimiters, move_speed, consume_rate, id=ENTITY_COUNT) {
    this.id = id
    this.food_tokens = food_tokens
    this.delimiters = delimiters
    this.move_speed = move_speed
    this.consume_rate = consume_rate
    this.phase = ENTITY_PHASES.learning
    this.known_places = []

    ENTITY_LIST.push(this)
    ENTITY_COUNT += 1
}

Entity.prototype.next = () => {

}

Entity.prototype.ponder = pt => {

}