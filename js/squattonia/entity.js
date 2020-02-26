// Handles everything that is in the world 
var ENTITY_COUNT = 0
const ENTITY_LIST = []

function Entity(memory=new Map(), funcs=[], id=ENTITY_COUNT) {
    this.memory = memory // knowledge held by the entity
    this.funcs = funcs // what the entity can do
    this.id = id

    ENTITY_LIST.push(this)
    ENTITY_COUNT += 1
}

Entity.prototype.exec = () => {

}

Entity.prototype.addComponent = c => {

}

Entity.prototype.removeComponent = c => {

}