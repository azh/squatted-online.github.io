// Handles the navigation pane

const UI_NAVIGATION = gfx => {
    let _root = gfx.select('#navigation')
    let _update = true
    let _canvas = null
    let _place_ids = new Map()
    let _place_coords = new Map()
    let _selected_node = null

    let _node_size = 30
    let _screen_divisor = 40

    let _spr_graph = new Springy.Graph()
    let _spr_layout = new Springy.Layout.ForceDirected(_spr_graph, 100.0, 6000.0, 0.2)
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
        })

    gfx.setup = () => {
        console.log("Loaded navigation")
        console.log(window.Springy)
        _canvas = gfx.createCanvas(_root.width - 2, _root.height - 2)
        _canvas.parent(_root)
        _canvas.position(_root.elt.offsetLeft + 1, _root.elt.offsetTop + 1)
        this.initMappings()
        _spr_renderer.start()
    }

    gfx.draw = () => {
        let rt = gfx.select('#navigation')
        if (rt.height !== _root.height || rt.width !== _root.width) {
            console.log("Navigation needs to be resized!")
            gfx.windowResized()
            _update = true
        }
        if (_update) {
            gfx.noFill()
            gfx.stroke("#da70d6")
            gfx.circle(_canvas.width / 2, _canvas.height / 2, 25)
            _update = false;
        }
    }

    gfx.mousePressed = () => {
        _selected_node = this.getClosestNode(new Springy.Vector(gfx.mouseX, gfx.mouseY))
        window.setState("selected", _selected_node !== null ? _selected_node.data.place : null)
    }

    gfx.windowResized = () => {
        _root = gfx.select('#navigation')
        gfx.resizeCanvas(_root.width - 2, _root.height - 2);
        _canvas.position(_root.elt.offsetLeft + 1, _root.elt.offsetTop + 1)
        _update = true;
    }

    gfx.stateChanged = (prop, value) => {
        if (prop === "mappings") {
            this.updateMappings(window.STATE.mappings)
        }
    }

    this.initMappings = mappings => {
        let root_node = _spr_graph.newNode({
            label: "."
        })
        _place_ids.set(".", root_node.id)
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
                _spr_graph.newEdge(root_node, node)
            }
        }
        console.log(_spr_graph)
    }

    this.updateMappings = mappings => {
        // ...
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
        let sx = p.x * _root.width / _screen_divisor + _root.width / 2
        let sy = p.y * _root.height / _screen_divisor + _root.height / 2
        return new Springy.Vector(sx, sy)
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