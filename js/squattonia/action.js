function Action(name, target_type, func) {
    this.name = name
    this.target_type = target_type
    this.func = func 
    this.exec = (...args) => func.apply(null, args)
}

Action.TARGET_TYPES = {
    place: "action_target_place",
    entity: "action_target_entity"
}

const ACTIONS = {
    // place
    go: new Action("Go here", Action.TARGET_TYPES.place, p => {
        console.log("Going to " + p.name)
        window.loadPlacePage(p).then(arr => {
            console.log("Loaded the page " + p.name)
            window.setState(["navigation", "active"], p)
            window.setState(["navigation", "mode"], window.UI.navigation.MODES.text)
        })
    }),
    back: new Action("Back to map", Action.TARGET_TYPES.place, p => {
        console.log("Returning to map")
        window.loadPlacePage(p).then(arr => {
            console.log("Loaded the page " + p.name)
            window.setState(["navigation", "active"], null)
            window.setState(["navigation", "mode"], window.UI.navigation.MODES.map)
        })
    }),
    modalView: new Action("View place", Action.TARGET_TYPES.place, p => {

    }),
    spin: new Action("", Action.TARGET_TYPES.place, p => {
        window.trigger("spin", p)
    }),
    // entity
    consume: new Action("View place", Action.TARGET_TYPES.entity, p => {

    }),
    produce: new Action("View place", Action.TARGET_TYPES.entity, p => {

    }),
    changeMode: new Action("", Action.TARGET_TYPES.entity, p => {

    }),
    move: new Action("", Action.TARGET_TYPES.entity, p => {

    }),
    movePlaces: new Action("View place", Action.TARGET_TYPES.entity, p => {

    }),

}