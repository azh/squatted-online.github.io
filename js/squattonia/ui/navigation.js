// Handles the navigation pane

const UI_NAVIGATION = gfx => {
    gfx.MODES = {
        map: "navmode_map", // default
        text: "navmode_text",
        image: "navmode_image"
    }

    gfx.ROOT = gfx.select('#navigation')
    gfx.SCREEN_OFFSET = new Springy.Vector(0, 0)
    gfx.CANVAS = (gfx.CANVAS === undefined) ? null : gfx.CANVAS

    let _update = true
    let _place_ids = new Map()
    let _place_coords = new Map()
    let _selected_node = null

    let _node_size = 30
    let _screen_divisor = 40

    let _spr_graph = new Springy.Graph()
    let _root_node = _spr_graph.newNode({
        label: ".",
        data: {
            place: new Place(".")
        }
    })
    let _spr_layout = new Springy.Layout.ForceDirected(_spr_graph, 100.0, 6000.0, 0.2)
    let _spr_complete = false
    let _spr_renderer = new Springy.Renderer(
        _spr_layout,
        () => gfx.clear(),
        (edge, p1, p2) => {
            let dir = p2.subtract(p1).normalise()
            let np1 = this.toScreen(p1).add(dir.multiply(_node_size))
            let np2 = this.toScreen(p2).subtract(dir.multiply(_node_size))
            let pos1 = np1
            let pos2 = np2
            gfx.stroke("#da70d6")
            gfx.line(pos1.x, pos1.y, pos2.x, pos2.y)
            // console.log("drawing an edge from ", p1, " to ", p2)
        },
        (node, p) => {
            let pos = toScreen(p)
            gfx.stroke("#da70d6")
            gfx.textAlign(gfx.CENTER, gfx.CENTER)
            if (node === _selected_node) {
                gfx.fill("#0f0")
            } else {
                gfx.noFill()
            }
            if (node.data.label.indexOf(".") !== -1) {
                if (node.data.label.length > 1) {
                    gfx.triangle(pos.x, pos.y - _node_size / 2,
                        pos.x + _node_size / 2, pos.y + _node_size / 2,
                        pos.x - _node_size / 2, pos.y + _node_size / 2)
                    gfx.textAlign(gfx.LEFT, gfx.CENTER)
                } else {
                    this.star(pos.x, pos.y, _node_size / 2, _node_size, 5)
                }
            } else {
                gfx.circle(pos.x, pos.y, _node_size)
            }
            gfx.textSize(node.data.label !== "." ? 16 : 32)
            gfx.textFont("Courier")
            if (window.STATE.gifts.indexOf(window.GIFTS.text) !== -1) {
                if (node === _selected_node) {
                    gfx.fill("#da70d6")
                } else {
                    gfx.noFill()
                }
                gfx.text(node.data.label, pos.x, pos.y)
            }
            _place_coords.set(node.data.place, pos)
            if (_spr_complete) {
                _spr_renderer.stop()
            }
        },
        () => {
            _spr_complete = true
        })

    gfx.setup = () => {
        window.NAVLAYOUT = _spr_layout
        console.log("Loaded navigation")
        console.log(window.Springy)
        gfx.CANVAS = gfx.createCanvas(gfx.ROOT.width - 2, gfx.ROOT.height - 2)
        gfx.CANVAS.parent(gfx.ROOT)
        gfx.CANVAS.position(gfx.ROOT.elt.offsetLeft + 1, gfx.ROOT.elt.offsetTop + 1)
        // this.initMappings(window.STATE.mappings)
        this.initMappingsDemo()
        gfx.startGraph()
    }

    gfx.draw = () => {
        let rt = gfx.select('#navigation')
        if (rt.height !== gfx.ROOT.height || rt.width !== gfx.ROOT.width) {
            console.log("Navigation needs to be resized!")
            gfx.windowResized()
            _update = true
        }
        if (_update) {
            gfx.noFill()
            gfx.stroke("#da70d6")
            gfx.circle(gfx.CANVAS.width / 2, gfx.CANVAS.height / 2, 25)
            _update = false;
        }
    }

    gfx.startGraph = () => {
        if (window.STATE.navigation.mode === gfx.MODES.map) {
            _spr_renderer.start()
        }
    }

    gfx.mousePressed = () => {
        if (gfx.mouseX >= 0 && gfx.mouseX <= gfx.ROOT.width &&
            gfx.mouseY >= 0 && gfx.mouseY <= gfx.ROOT.height) {
                gfx.startGraph()
                _selected_node = this.getClosestNode(new Springy.Vector(gfx.mouseX, gfx.mouseY))
                let sel = _selected_node !== null ? _selected_node.data.place : null
                if (window.STATE.selected !== sel) {
                    window.setState("selected", sel)
                }
            }
    }

    gfx.mouseDragged = () => {
        if (gfx.mouseX >= 0 && gfx.mouseX <= gfx.ROOT.width &&
            gfx.mouseY >= 0 && gfx.mouseY <= gfx.ROOT.height) {
                gfx.SCREEN_OFFSET.x += gfx.mouseX - gfx.pmouseX
                gfx.SCREEN_OFFSET.y += gfx.mouseY - gfx.pmouseY
            }
        gfx.startGraph()
    }

    gfx.windowResized = () => {
        gfx.ROOT = gfx.select('#navigation')
        gfx.resizeCanvas(gfx.ROOT.width - 2, gfx.ROOT.height - 2);
        gfx.CANVAS.position(gfx.ROOT.elt.offsetLeft + 1, gfx.ROOT.elt.offsetTop + 1)
        _update = true;
    }

    gfx.stateChanged = (key, val) => {
        if (key === "mappings") {
            gfx.startGraph()
            this.updateMappings(val)
        } else if (key === "navigation.mode") {
            if (val === "navmode_text") {
                if (window.STATE.gifts.indexOf("gift_text") !== -1) {
                    _spr_renderer.stop()
                    UI_NAVIGATION_TEXT(gfx)
                } else {
                    window.UI.output.newEntry("p", "Slow down, and try claiming your present first.")
                    window.setState(["navigation", "mode"], "navmode_map")
                }
            }        
            if (val === "navmode_map") {
                _spr_renderer.start()
            }        
        } else if (key === "gifts") {
            gfx.startGraph()
        }
    }

    this.initMappings = mappings => {
        _place_ids.set(".", _root_node.id)
        for (mp of mappings) {
            this.updateMappings(mp)
        }
        console.log(_spr_graph)
    }

    this.initMappingsDemo = () => {
        _place_ids.set(".", _root_node.id)
        console.log(window.SYS.world.lands)
        for (l of window.SYS.world.lands) {
            let node = _spr_graph.newNode({
                label: l.name,
                place: l
            })
            _place_ids.set(l.name, node.id)
            if (l.territory !== null) {
                let tnode = _place_ids.has(l.territory.name) ? _spr_graph.nodes[_place_ids.get(l.territory.name)] : _spr_graph.newNode({
                    label: l.territory.name,
                    place: l.territory
                })
                _spr_graph.newEdge(tnode, node)
            } else {
                _spr_graph.newEdge(_root_node, node)
            }
        }
        console.log(_spr_graph)
    }

    this.updateMappings = mp => {
        console.log(mp)
        if (mp[1] !== null) {
            let node = mp[0] === null ? _root_node : _spr_graph.newNode({ label: mp[0].name, place: mp[0] })
            if (mp[0] !== null) {
                _place_ids.set(mp[0].name, node.id)
            }
            let tnode = _place_ids.has(mp[1].name) ? _spr_graph.nodes[_place_ids.get(mp[1].name)] : _spr_graph.newNode({
                label: mp[1].name,
                place: mp[1]
            })
            if (!_place_ids.has(mp[1].name)) {
                _place_ids.set(mp[1].name, tnode.id)
            }
            _spr_graph.newEdge(node, tnode)
        }
    }

    this.getClosestNode = pos => {
        let closest = _spr_graph.nodes[0]
        let closest_magn = Number.MAX_SAFE_INTEGER
        for (let n of _spr_graph.nodes) {
            let magn = _place_coords.get(n.data.place).subtract(pos).magnitude()
            if (magn < closest_magn) {
                closest = n
                closest_magn = magn
            }
        }
        return (closest_magn <= _node_size) ? closest : null
    }

    this.toScreen = p => {
        let sx = p.x * gfx.ROOT.width / _screen_divisor + gfx.ROOT.width / 2
        let sy = p.y * gfx.ROOT.height / _screen_divisor + gfx.ROOT.height / 2
        return (new Springy.Vector(sx, sy)).add(gfx.SCREEN_OFFSET)
    }

    this.star = (x, y, radius1, radius2, npoints) => {
        let angle = gfx.TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        gfx.beginShape();
        for (let a = 0; a < gfx.TWO_PI; a += angle) {
            let sx = x + gfx.cos(a) * radius2;
            let sy = y + gfx.sin(a) * radius2;
            gfx.vertex(sx, sy);
            sx = x + gfx.cos(a + halfAngle) * radius1;
            sy = y + gfx.sin(a + halfAngle) * radius1;
            gfx.vertex(sx, sy);
        }
        gfx.endShape(gfx.CLOSE);
    }

}

window.loadNav = () => window.NAVIGATION = new p5(UI_NAVIGATION)