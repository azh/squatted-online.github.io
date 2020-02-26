// Data and functions for the world

var _redraw = true

const LOWEST_LAYER = 1 // starts at 1, all lands are a subdivision of the world
// const LAND_ELEMENTS = ["P", "A", "LI", "H1", "H2", "H3", "IMG"] // elements that are inhabitable land

function World(world_root) {
	this.world_root = world_root
	this.lands = []
	this.world_map = new Map()
	this.entity_count = 0
	initWorld(this)
}

function Place(name, layer, territory=null) {
	if (layer === 0 && territory !== null) {
		console.error(`ERROR: place ${name} is a territory of ${territory} but can't be`)
	}
    this.name = name
    this.layer = layer // level of nesting in the squat map, the lowest is 1
	this.territory = territory // what other place this is part of
}

Place.prototype.getLocation = function(loc="", land=this) { // relative url
	let name = land.name
	loc = name.slice(0, name.indexOf(" =>") !== -1 ? name.indexOf(" =>") : name.length) + "/" + loc
	if (land.territory === null) {
		return loc
	}
	return land.getLocation(loc, land.territory)
}

function initWorld(world) {
	getWorld(world)
	console.log("Initialized world")
}

// get all of the lands of squattonia (aka the squat map and its hierarchy) by keeping track of how 
// much space there is before the actual content for each line.
function getWorld(world) {
	// parse lands from squat map
	let lands = []
	console.log(world.world_root)
	let world_arr = world.world_root.innerText.split("\n")
	let layer = 0
	let prev_leading_spaces = [0]
	let content_regex = /[^\s─│├└]/ // assuming filenames don't start with spaces or these pipe things
    let spaces = []
	for (p of world_arr.slice(1)) { // ignore the title and smiley
        let spaces = p.match(content_regex)
		if (spaces !== null) {
            spaces.push([spaces, spaces ? spaces.index : "null", p])
			// increment layer and track spaces if this is a deeper layer, decrement if it's shallower
			if (spaces.index > prev_leading_spaces[layer]) {
				layer++
				if (prev_leading_spaces[layer] === undefined) {
					prev_leading_spaces.push(spaces.index)
				}
			} else  { 
				// no idea if this ever gets to run more than once
				while (spaces.index < prev_leading_spaces[layer]) {
					layer--
				}
			}
			// get the name from a squat map line then make a new land
			let land = null
			if (p.split("─").length === 3) { // lines end with 2 of these bars so they have 3 splits
				land = new Place(p.split("─")[2].trim(), layer)
			} else if (p.trim().length > 0) { // for lines with nothing behind them, probably unneeded
				console.warn(`NOTE: the line "${p}" has no hierarchy pipes`)
				land = new Place(p.trim(), layer)
			}
			lands.push(land)
		}
	}
	// create world map
	let land_queue = [] // temporary list of lands that need to be assigned a territory
	for (let i = lands.length - 1; i > 0; i--) { // go backwards through the list of lands to assign all the territories
		let land = lands[i]
		let land_next = lands[i - 1]

		// if the next land is at a lower layer, the lands right before it at the current land's level 
		// are its territories
		if (land_next.layer < land.layer) {
            land.territory = land_next
            if (!world.world_map.has(land_next)) { // add to world map if it isn't there
                world.world_map.set(land_next, [land])
            }
			// move forward through the list to add any other territories
			for (let k = i; k < lands.length; k++) {
				if (lands[k].layer < land.layer) {
					break
				}
                if (lands[k].layer === land.layer) {
                    lands[k].territory = land_next
                    if (world.world_map.get(land_next).indexOf(lands[k]) === -1) {
                        world.world_map.get(land_next).push(lands[k])
                    }

                }
            }
		} else { // no child territories
            world.world_map.set(land_next, [])
        }
	}

	world.lands = lands
	console.log(world_arr)
    console.log(world.world_map)
}