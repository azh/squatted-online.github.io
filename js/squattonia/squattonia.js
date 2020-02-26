// LANDS OF SQUATTONIA, AN EXCITING ROLE PLAYING GAME FOR SQUATTED.ONLINE

var WORLD_ROOT
var DOC_BODY
var LANDS = []
var WORLD_MAP = new Map()
var _redraw = true
var ENTITY_COUNT = 0

const LOWEST_LAYER = 1 // starts at 1, all lands are a subdivision of the world
// const LAND_ELEMENTS = ["P", "A", "LI", "H1", "H2", "H3", "IMG"] // elements that are inhabitable land

function Place(name, layer, location=getRandomLocation(), territory=null, ) {
	if (layer === 0 && territory !== null) {
		console.error(`ERROR: place ${name} is a territory of ${territory} but can't be`)
	}
    this.name = name
	this.location = location // [x, y] coordinates
    this.layer = layer // level of nesting in the squat map, the lowest is 1
    this.territory = territory // what other place this is part of
}

function initWorld(el) {
    getWorld(el, 0)    
}

// get all of the lands of squattonia (aka the squat map and its hierarchy) by keeping track of how 
// much space there is before the actual content for each line.
function getWorld() {
	// parse lands from squat map
	let lands = []
	let world_arr = window.WORLD_ROOT.elt.innerText.split("\n")
	let layer = 0
	let prev_leading_spaces = [0]
	let content_regex = "[^  ─│├└]" // assuming filenames don't start with spaces or these pipe things

	for (p of world_arr.slice(2)) { // ignore the title and smiley
		let spaces = p.match(content_regex)
		if (spaces !== null) {
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
	for (let i = lands.length - 1; i > 0; i--) {
		let land = lands[i]
		let land_next = lands[i - 1]

		// if the next land is at a lower layer, the lands right before it at the current land's level 
		// are its territories
		if (land_next.layer < land.layer) {
			land.territory = land_next
			// move back through the list to add any other territories
			for (let k = i; k < lands.length; k++) {
				if (lands[k].layer !== land.layer) {
					break
				}
				lands[k].territory = land_next
			}
		}
	}
	for (let l of lands) {
		window.WORLD_MAP.set(l, l.territory)
	}

	window.LANDS = lands
	console.log(world_arr)
	console.log(window.WORLD_MAP)
}

// get a random place
function getRandomLocation(x_margin, y_margin) {
	let x = Math.random() * WORLD_ROOT.width
	let y = Math.random() * WORLD_ROOT.height
	return [x < x_margin ? x + x_margin : x, 
			y < y_margin ? y + y_margin : y]
}

// place all the locations on the map
function initLocations() {

}

function setup() {
    window.DOC_BODY = select(".map")
	window.WORLD_ROOT = select(".map")

	let canv = createCanvas(DOC_BODY.width, DOC_BODY.height + 100);
	canv.position(WORLD_ROOT.elt.offsetLeft, WORLD_ROOT.elt.offsetTop)	
	frameRate(10)
    console.log("Welcome to Squattonia...")
    initWorld(window.WORLD_ROOT.elt)
    //Set Cell Stroke Weight
	voronoiCellStrokeWeight(1);
	//Set Site Stroke Weight
	voronoiSiteStrokeWeight(3);
	//Set Cell Stroke
	voronoiCellStroke(0);
	//Set Site Stroke
	voronoiSiteStroke(0);
	//Set flag to draw Site
	voronoiSiteFlag(true);

	/*
	//Sets 30 random sites with 50 minimum distance to be added upon computing
	//Please note that this method is just for testing, you should use your own
	//method for placing random sites with minimum distance
	voronoiRndSites(30, 50);

	//Add array of custom sites
	voronoiSites([[5,5],[10,5],[15,5]]);

	//Add array of custom sites with custom colors associated (255 = white)
	voronoiSites([[5,20,255],[10,20,255],[15,20,255]]);

	//Remove custom site with coordinates 15,5
	voronoiRemoveSite(15, 5);

	//Remove custom site with index 0 (in this case it's the site with coordinates [5,5])
	voronoiRemoveSite(0);

	//Add custom site with coordinates i*30,50
	for (var i = 0; i < 10; i++) {
		voronoiSite(i * 30, 50);
	}
	*/

	//Add custom site with custom color at coordinates 50,100 (255 = white)
	voronoiSite(100, 100, [255, 105, 180, 64]);
	voronoiSites([[5,20,[255, 105, 180, 100]],[10,20,[255, 105, 180, 128]],[15,20,[255, 105, 180, 200]]]);

	//Clear custom sites (does not clear random sites)
	//voronoiClearSites();

	//Jitter Settings (These are the default settings)

	//Maximum distance between jitters
	voronoiJitterStepMax(20);
	//Minimum distance between jitters
	voronoiJitterStepMin(5);
	//Scales each jitter
	voronoiJitterFactor(3);
	//Jitter edges of diagram
	voronoiJitterBorder(false);

	//Compute voronoi diagram
	//With a prepared jitter structure (true)
	voronoi(window.width, window.height, true);

	//Get the raw diagram, for more advanced use
	//This is purely to get information, doesn't change the diagram
	//https://github.com/gorhill/Javascript-Voronoi
	var diagram = voronoiGetDiagram();
	console.log(diagram);

	//Get simplified cells without jitter, for more advanced use
	var normal = voronoiGetCells();
	console.log(normal);

	//Get simplified cells with jitter, for more advanced use
	var jitter = voronoiGetCellsJitter();
    console.log(jitter);
}


function windowResized() {
	resizeCanvas(DOC_BODY.width, DOC_BODY.height + 100);
}

function draw(){
	//Draw diagram in coordinates 0, 0
	//Filled and without jitter
	if (_redraw) {
		voronoiDraw(0, 0, true, true, 128);
		_redraw = false
	}

	//Get id of voronoi cell that contains the coordinates mouseX, mouseY without accounting for jitter(false)
	//Note that these coordinates are relative to the voronoi diagram and not any drawn diagram.
	//In this example we can use mouseX and mouseY directly since we drawn our diagram at
	//coordinates 0,0

	function mousePressed() {
		_redraw = true
		let cellId = voronoiGetSite(mouseX, mouseY, false);
		//Get ids of voronoi cells neighboring cellId
		//Ctrl+Shift+I on Chrome to open the console
		console.log(cellId + ": " + voronoiNeighbors(cellId));

		//Get color of selected voronoi cell
		console.log("Color: " + voronoiGetColor(cellId));

		//Draw a specific voronoi cell using different centers

		//Draw cell from top left without jitter
		voronoiDrawCell(800, 10, cellId,VOR_CELLDRAW_BOUNDED, true, false);
		//Draw cell frame from top left with jitter
		voronoiDrawCell(1000, 10, cellId,VOR_CELLDRAW_BOUNDED, false, true);

		//Draw cell from site without jitter
		voronoiDrawCell(800, 300, cellId,VOR_CELLDRAW_SITE, true, false);
		//Draw cell frame from site with jitter
		voronoiDrawCell(1000, 300, cellId,VOR_CELLDRAW_SITE, false, true);

		//Draw cell from geometric center without jitter
		voronoiDrawCell(800, 610, cellId,VOR_CELLDRAW_CENTER, true, false);
		//Draw cell frame from geometric center with jitter
		voronoiDrawCell(1000, 610, cellId,VOR_CELLDRAW_CENTER, false, true);

	}


	//Guide lines to compare different draw modes

	//Vertical Line 1
	line(800,10,800,800);
	//Vertical Line 2
	line(1000,10,1000,800);
	//Horizontal Line 1
	line(800,10,1200,10);
	//Horizontal Line 2
	line(800,300,1200,300);
	//Horizontal Line 3
	line(800,610,1200,610);
}
