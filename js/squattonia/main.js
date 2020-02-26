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
    mappings: new Map(),
}

window.setMapping = (key, val) => {
    window.STATE.mappings.set(key, val)
    for (u in window.UI) {
        if (window.UI[u].stateChanged !== undefined) {
            window.UI[u].stateChanged("mappings")
        }
    }
}

window.setState = (key, val) => {
    window.STATE[key] = val
    for (u in window.UI) {
        if (window.UI[u].stateChanged !== undefined) {
            window.UI[u].stateChanged(key, val)
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
        //actions: new p5(UI_ACTIONS, document.getElementById('actions')),
        renderer: new p5(UI_RENDERER),
    }

    
    let rend = window.UI.renderer
    let log = window.UI.output
    log.newEntry("p", "Welcome! Claim your present below.")
    rend.makeEmoji("🎁", log.newEntry("a.present", "", false), giftText)
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
    window.STATE.gifts.push(GIFTS.text)
    window.UI.output.newEntry("p.alert", "Received the gift of text.")
    this.mouseClicked(false)
}