window.GIFTS = {
    text: "gift_text",
    image: "gift_image",
}

window.UI = {}

window.STATE = {
    gifts: [],
    entities: [],
    location: null,
    selected: null,
    mappings: [],
    loaded_pages: new Map(),
    navigation: {
        mode: "navmode_map",
        active: null
    },
    actions: {
        available_actions: []
    }
}

window.loadPlacePage = async place => {
    let arr = false
    if (!STATE.loaded_pages.has(place)) {
        arr = await UTIL.urlToArr32(UTIL.base_url + place.getLocation(), window.UI.renderer, window.Tone)
        STATE.loaded_pages.set(place, arr)
        for (u in window.UI) {
            if (window.UI[u].stateChanged !== undefined) {
                window.UI[u].stateChanged("loaded_pages", place)
            }
        }
    } else {
        arr = STATE.loaded_pages.get(place)
    }
    return arr
}

window.pushToState = (key, val) => {
    let outkey = key
    if (typeof(key) === "object" && key.length === 2) {
        window.STATE[key[0]][key[1]].push(val)
        outkey = key[0] + "." + key[1]
    } else {
        window.STATE[key].push(val)
    }
    for (u in window.UI) {
        if (window.UI[u].stateChanged !== undefined) {
            window.UI[u].stateChanged(outkey, val)
        }
    }
}

window.setState = (key, val) => {
    let outkey = key
    if (typeof(key) === "object" && key.length === 2) {
        window.STATE[key[0]][key[1]] = val
        outkey = key[0] + "." + key[1]
    } else {
        window.STATE[key] = val
    }
    for (u in window.UI) {
        if (window.UI[u].stateChanged !== undefined) {
            window.UI[u].stateChanged(outkey, val)
        }
    }
}

// just setState that doesn't change state because i can't be bothered to make an event queue
window.trigger = (key, val) => {
    let outkey = key
    if (typeof(key) === "object" && key.length === 2) {
        outkey = key[0] + "." + key[1]
    }
    for (u in window.UI) {
        if (window.UI[u].stateChanged !== undefined) {
            window.UI[u].stateChanged(outkey, val)
        }
    }
}

$(window).on('load', async function() {
    window.SYS = {
        world: new World(document.getElementById("directory")),
        entity: "",
    }

    window.UI = {
        directory: new p5(UI_DIRECTORY, document.getElementById('directory')),
        navigation: new p5(UI_NAVIGATION, document.getElementById('navigation')),
        output: new p5(UI_OUTPUT, document.getElementById('output')),
        actions: new p5(UI_ACTIONS, document.getElementById('actions')),
        renderer: new p5(UI_RENDERER),
    }

    let rend = window.UI.renderer
    let log = window.UI.output

    pushToState("mappings", [null, window.SYS.world.lands[6]])
    log.newEntry("p", "Welcome! Claim your present below.")
    rend.makeEmoji("🎁", log.newEntry("a.present", "", false), giftText)
    await loadPlacePage(window.SYS.world.lands[6])
    /*
    console.log(await UTIL.urlToArr('http://localhost:3000/garden/1.6daace69.jpg', rend))
    console.log(await UTIL.urlToArr('http://localhost:3000/staircase/cellar/rave_cave/drum_samples/bass_sample.mp3', rend, window.Tone))
    */
});

function giftText(ev) {
    if (ev.target.parentElement.nodeName === "A") {
        if (!ev.target.parentElement.classList.contains('clicked')) {
            ev.target.parentElement.classList.add('clicked')
        }
    } else {
        ev.target.classList.add('clicked')
    }
    window.pushToState("gifts", GIFTS.text)
    window.UI.output.newEntry("p.alert", "Received the gift of text.")
    this.mouseClicked(false)
}