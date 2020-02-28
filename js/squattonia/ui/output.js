// Output log.

const UI_OUTPUT = gfx => {
    let _root = null
    let _start_time = Date.now()

    gfx.setup = () => {
        _root = gfx.select("#output")
        console.log("Loaded output")
    }

    gfx.stateChanged = (key, val) => {
        if (key === "overwhelming") {
            gfx.newEntry("p", "There's an overwhelming amount of info being displayed. You're going to have to feel things out.")
        }
    }

    gfx.timestamp = () => (new Date(Date.now() - _start_time)).toISOString().substr(11, 8),
    
    gfx.newEntry = (tag, data="", timestamp=true, styles={}) => {
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
        if (timestamp) {
            let tel = gfx.createElement("p", `[${gfx.timestamp()}]`)
            tel.addClass("timestamp")
            tel.parent(el)
        }
        for (s in styles) {
            el.style(s, styles[s])
        }
        el.parent(_root)
        el.html(data, true)
        _root.elt.scrollTop = _root.elt.scrollHeight
        return el
    }
}