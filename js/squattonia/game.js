// Handles the game logic.

// game premise
// something has gone wrong, this isn't a fantasy rpg
// hop worlds
// the map is the territory
// depending on how you look at the information you can do different things

// gameplay elements
// - changing connections
//      - finding new places
//      - going back to normal
// - manipulating data
//      - yourself (replacing a fragment with another one generated through markov chain?)
//      - by convincing entities
// - manipulating entities
//      - some shin megami tensei thing like transforming them to other modalities or combining them
//      - learn their natural patterns
//      - tame them

// location connections
// markov chain? on raw data of link creates connections between the links
// you start off only knowing the index link, talk to people and mess with data to find more
// how to dynamically decide what tokens should be delimiters?

// each file has a markov chain map, master map that has every single unique map entry across files, editing this has repercussions

// actions
// finagle - edit information, make or break connections, increase entropy?
// suss - interpret information, find connections, decrease entropy?

// the entities
// manipulate data just like you to stay alive
// spring forth if some piece of data is running low
//  - anti-entropy force? pro-entropy force?
//  - data creatures that consume and produce data
// bound to one modality but you can transform them to work in other ones
// get along with them and you can summon them
// contents
// - bandwidth
//  - rate of movement
//  - rate of data consumption
// - stop tokens: tokens that are irrelevant to it
// - delimit length
//  - analogous to physical size
// - desired tokens
//  -
// - actions
//  - movement
//  - mutation
//  - produced tokens
// - cognition map
// ecosystem of entities
//  - what tokens they like to consume
//  - what tokens they produce
//  - the importance of these tokens in the battle towards... intelligibility? low shannon entropy?
// taming an entity
// - an entity is essentially tamed if it comes to value your presence and guidance
//  - i.e. situational vectors that involve you are pinged first
// cognition map: "radar" learning vector quantization/self-organizing map/???
//  - like knn except when aggregating neighbours two weightings are considered
//      1. rating weighting: each point in space tracks the success rating of all actions
//          - you get this for free from the probability distribution of a naive bayes classifier
//          - consecutive successes/failures have a slight curve to them so they kind of snowball
//      2. distance weighting: nearby points matter more than further ones
//  - fans outwards triggering points until one activates like a radar
//  - instead of k nearest neighbours, have k units travelled
//      - so probably normalize each dimension before doing this radar scan
//      - probability distribution of actions generated from those points within the k-radius hyper(sphere? ellipsoid?)

// files
// entropy as an indirect difficulty level
// - if entropy is higher is there more or less of a chance of finding a certain pattern?
// unlock new connections by getting the same patterns
// - hyperloglog to check if patterns are in some file

// objective?
// you're in a messed up version, return to normal (shown in the directory)
// deviance: how much the directory differs from normal

// We all know that a squat isn't possible without any residents. 
// However, a digital squat not only has human residents, but also non-human residents--pieces of information that, even if they want to be free, are relegated to being little more than virtual drywall.
// In THE LANDS OF SQUATTONIA, these other squatters have a life of their own. Get to know them, and see the squat their way.