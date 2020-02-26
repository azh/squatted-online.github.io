// Offscreen canvas that is used to make graphics that appear outside p5.

const UI_RENDERER = gfx => {
    let _canv = null

    gfx.setup = () => {
        console.log("Loaded renderer")
    }
    
    gfx.makeEmoji = (emoji, el, onclick=()=>{}) => {
        _canv = gfx.createGraphics(64, 64)
        _canv.textSize(64);
        _canv.textAlign(gfx.LEFT, gfx.TOP)
        _canv.text(emoji, 0, 10)
        _canv.elt.toBlob(b => {
            let a = gfx.createElement('a')
            a.attribute('href', '#')
            let img = gfx.createImg(URL.createObjectURL(b), "present for you")
            img.parent(a)
            a.parent(el)
            a.mouseClicked(onclick)
        })
    }

    gfx.drawArray32 = (arr, el) => {
        let size = Math.ceil(Math.sqrt(arr.length))
        _canv = gfx.createGraphics(size, size)
        let img = _canv.createImage(size, size)
        img.loadPixels()

        let ctr = 0
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (ctr === arr.length) {
                    break
                }
                let ind = (x + y * size) * 4
                let c = UTIL.decToRGBA(arr[ctr])
                img.pixels[ind] = c[0]
                img.pixels[ind + 1] = c[1]
                img.pixels[ind + 2] = c[2]
                img.pixels[ind + 3] = c[3]
                ctr++
            }
        }
        img.updatePixels()
        _canv.image(img, 0, 0)
        _canv.elt.toBlob(b => {
            let a = gfx.createElement('a')
            a.attribute('href', '#')
            let image = gfx.createImg(URL.createObjectURL(b), "present for you")
            image.parent(a)
            a.parent(el)
            image.mousePressed(alert.bind(null, "clicky"))
        })
    }
}