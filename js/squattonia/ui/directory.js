const UI_DIRECTORY = gfx => {
    let _root = gfx.select('#directory')
    let _update = true

    gfx.setup = () => {
        console.log("Loaded directory")
    }

    gfx.draw = () => {
        if (_update) {
            _root.elt.innerHTML = ""
            let lands = window.SYS.world.lands.slice()
            drawDirectory(lands)
            _update = false
        }
    }

    gfx.stateChanged = (key, val) => {
        switch (key) {
            case "selected":
                _update = true
                break
        }
    }

    drawDirectory = lands => {
        el = gfx.createElement("p", ".")
        el.parent(_root)
        for (let i = 0; i < lands.length; i++) {
            if (lands[i].layer === 1) {
                drawDirectoryTree(lands, lands[i])
            } 
        }
    }

    // algorithm swiped from https://github.com/kddeisz/tree/blob/master/tree.js
    drawDirectoryTree = (land_list, land, prefix="") => { // draw the directories line by line
        let world_map = window.SYS.world.world_map
        let el = false;
        let selected = land === window.STATE.selected
        if (land === land_list.slice(-1)[0]) { // last land in the list of all lands
            el = gfx.createElement("p", prefix + "└── " + land.name)
            if (selected) {
                el.addClass("selected")
            }
            el.parent(_root)
        } else {
            if (land.territory !== null) { // is the land nested?
                if (land === world_map.get(land.territory).slice(-1)[0]) { // last land in the current nesting
                    el = gfx.createElement("p", prefix + "└── " + land.name)
                    if (selected) {
                        el.addClass("selected")
                    }
                    el.parent(_root)
                    if (world_map.get(land).length > 0) {
                        for (l of world_map.get(land)) {
                            drawDirectoryTree(land_list, l, prefix + "&nbsp;")
                        }  
                    }
                } else {
                    el = gfx.createElement("p", prefix + "├── " + land.name)
                    if (selected) {
                        el.addClass("selected")
                    }
                    el.parent(_root)
                    if (world_map.get(land).length > 0) {
                        for (l of world_map.get(land)) {
                            drawDirectoryTree(land_list, l, prefix + "|&nbsp;")
                        }  
                    }
                }
            } else {
                el = gfx.createElement("p", prefix + "├── " + land.name)
                if (selected) {
                    el.addClass("selected")
                }
                el.parent(_root)
                if (world_map.get(land).length > 0) {
                    for (l of world_map.get(land)) {
                        drawDirectoryTree(land_list, l, prefix + "|&nbsp;")
                    }  
                }
            }
        }      
    }
}

window.loadDir = () => window.DIRECTORY = new p5(UI_DIRECTORY)
