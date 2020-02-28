// Context menu which displays the actions that can be taken.

const UI_ACTIONS = gfx => {
    let _canv = null
    let _root = gfx.select("#actions")

    gfx.setup = () => {
        console.log("Loaded actions")
    }

    gfx.stateChanged = (key, val) => {
        this.populateActions(val)
    }

    this.populateActions = obj => {
        console.log(obj)
        _root.html("")
        if (obj && obj.territory !== undefined) {
            this.addElement("p#action_header", "Selected: " + obj.name)
            let ulel = this.addElement("ul#action_list")
            for (a in ACTIONS) {
                if (ACTIONS[a].name !== "" && ACTIONS[a].target_type === Action.TARGET_TYPES.place && this.actionPossible(ACTIONS[a])) {
                    let el = this.addElement("a#action_item", ACTIONS[a].name)
                    el.attribute("href", "#")
                    if (obj.name === ".") {
                        el.mouseClicked(ACTIONS["spin"].exec.bind(null, obj))
                    } else {
                        el.mouseClicked(ACTIONS[a].exec.bind(null, obj))
                    }
                    let liel = this.addElement("li")
                    el.parent(liel)
                }
            }
        }
    }

    this.actionPossible = action => {
        if (action === ACTIONS.go) {
            if (window.STATE.navigation.mode !== "navmode_map") {
                return false
            }
            if (window.STATE.selected.name.indexOf(".") === -1) {
                return false
            }
        }
        if (action === ACTIONS.back) {
            if (window.STATE.navigation.mode === "navmode_map") {
                return false
            }
        }
        if (action === ACTIONS.modalView) {
            if (window.STATE.navigation.mode === "navmode_map") {
                return false
            }
        }
        return true
    }

    this.addElement = (tag, data="", timestamp=true, styles={}) => {
        let classname = tag.split(".")[1] || false
        let idname = tag.split("#")[1] || false
        let tagind = Math.min(classname ? tag.indexOf(".") : Number.MAX_SAFE_INTEGER, idname ? tag.indexOf("#") : Number.MAX_SAFE_INTEGER)
        let el = gfx.createElement(tagind !== -1 ? tag.slice(0, tagind) : tag)
        if (tag === "a") {
            el.attribute("href", "#")
        }
        if (classname) {
            let ii = classname.indexOf("#")
            el.addClass(classname.slice(0, ii === -1 ? classname.length : ii))
        }
        if (idname) {
            let ci = idname.indexOf(".")
            el.attribute("id", idname.slice(0, ci === -1 ? idname.length : ci))
        }
        for (s in styles) {
            el.style(s, styles[s])
        }
        el.parent(_root)
        el.html(data, true)
        return el
    }
    
}