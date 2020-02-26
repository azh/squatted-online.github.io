// LANDS OF SQUATTONIA, AN EXCITING ROLE PLAYING GAME FOR SQUATTED.ONLINE

var WORLD_ROOT
var DOC_BODY
var LANDS = []
var TERRITORIES = new Set()
var WORLD_MAP = new Map()
var LAND_ELEMENTS = ["P", "A", "LI", "H1", "H2", "H3", "IMG"] // elements that are inhabitable land
var _redraw = true

function Place(name, location, territory, layer) {
    this.name = name
    this.location = location || getRandomLocation()
    this.territory = territory
    this.layer = layer
}

function initWorld(el) {
    getWorld(el, 0)
    
    // convert territory html elements into Places
    let territories = new Set()
    window.LANDS.map(l => territories.add({terr: l.territory, layer: l.layer - 1}))
    let terrMap = new Map()
	territories.forEach(t => terrMap.set(t.terr, new Place(t.terr.innerText.slice(0, 150), t.terr, null, t.layer)))

    // update land territories to be places
    window.LANDS.map(l => l.territory = terrMap.get(l.territory))
    window.LANDS.map(l => window.TERRITORIES.add(l.territory))
}

// walk through the page to initialize the world map
function getWorld(el, layer) {
    layer = layer || 0
    if (el.children.length > 0) {
        for (e of el.children) {
            if (LAND_ELEMENTS.indexOf(e.nodeName) !== -1) {
                if (e.innerText === el.innerText) { // e is nested in el, update the location to be more specific
                    window.LANDS.slice(-1).location = e
                } else {
                    window.LANDS.push(new Place(e.innerText.slice(0, 150), e, el, layer))
                }
            }
            getWorld(e, layer + 1)
        }
    }
}

// get a random place
function getRandomLocation() {

}

function setup() {
    window.DOC_BODY = select("body")
	window.WORLD_ROOT = select(".container")
	window.WORLD_ROOT.elt.style.marginTop = '100px'

	let canv = createCanvas(DOC_BODY.width, DOC_BODY.height + 100);
	canv.position(0, 0)	
	frameRate(30)
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
	voronoiSite(100, 100, [255, 105, 180, 220]);
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
