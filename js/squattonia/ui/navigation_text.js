// Textual mode of navigation.

const UI_NAVIGATION_TEXT = gfx => {
    let _ready = true
    let _big_rendered = false

    console.log("Loaded text navigator")
    
    gfx.draw = () => {
        if (_ready) {
            gfx.background(255)
            gfx.textAlign(gfx.CENTER, gfx.CENTER)
            gfx.textFont("Courier")
            gfx.fill("#0f0")
            gfx.textSize(16)

            let ws = window.STATE
            let text = this.handleText(ws.loaded_pages.get(ws.navigation.active))
            let print = ""
            let print_y = 0

            if (text.length < 20000) {
                gfx.text(text, 16 + gfx.SCREEN_OFFSET.x, gfx.SCREEN_OFFSET.y)
            } else {
                window.trigger("overwhelming")
                gfx.mousePressed = () => {}
                gfx.textAlign(gfx.LEFT, gfx.TOP)
                print_y = 0
                for (let i = 0; i < Math.min(text.length, 1000000); i++) {
                    print += text[i]
                    if (i % Math.ceil(gfx.ROOT.width / 4) === 0) {
                        gfx.text(print, 0, print_y)
                        print_y += 2
                        print = ""
                    }
                }
                _ready = false
            }
        }
    }

    gfx.stateChanged = (key, val) => {
        if (key === "navigation.mode" ) {
            if (val === "navmode_text") {
                _ready = true
            } else {
                _ready = false
            }
            if (val === "navmode_map") {
                UI_NAVIGATION(gfx)
            }
        }
    }

    /*gfx.mouseDragged = () => {
        if (_ready) {
            if (gfx.mouseX >= 0 && gfx.mouseX <= _root.width &&
                gfx.mouseY >= 0 && gfx.mouseY <= _root.height) {
                    _screen_offset.x += gfx.mouseX - gfx.pmouseX
                    _screen_offset.y += gfx.mouseY - gfx.pmouseY
            }
        }
    }*/

    this.handleText = arr => {
        let decoder = new TextDecoder()
        return decoder.decode(arr)
    }

}