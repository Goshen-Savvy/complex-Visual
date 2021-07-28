
// what I want is a controller to connect crossfilter with index in the crawler window
// so the indicies are drawn properly.
// it will fire an event when a data point enters or leaves (is scheduled to leave?) the window

// TO write the version that takes a crossfilter as a attribute and a window controller as
// argumnets

// trying to extend crossfilter. Is this the best way? Note each new crawlfilter
// get its own instance of crossfilter as a prototype; so there are no class
// variables as prototype is not shared. Seems like a non-standard way to do this?

tracklayout = function(crawler){ // problem what about multiple cf's? they have to advance together.
    var layout = {}
    layout.crawler = crawler // the crawler generator
    // Object.setPrototypeOf(layout, new crossfilter(d))


    layout.tracksize = crawler.capacity // fixed number - not need?
    // layout.drawindex = [ index-tracksize-1 , index ] // - this should be the drawing filter for the crawl window
    layout.available = [0,layout.tracksize] // not need? available data window index - could it match the filter?
    layout.cycle = function (){}  // as data comes in (on the filter?), advance the crawler drawindex, 
                            // and redraw - when cycle is on, window will advance 
    // layout.reset(index) // set to a particular position, turn off cycling
    // layout.onRedrawRequest(reDrawcallback([drawindex array], crawl, cfx_with_filter, trackno))
    // remember to move to groups when all cf's data has advanced
    layout.datalength = 0 // current points in layout - minimax of cf's
    layout.cfsReady = 0 // how many cfs are ready to advance max
    layout.onAdvanceCallback = null
    layout.onNewData = function (callbackf){
        layout.onAdvanceCallback = callbackf
    }

    let registry = []
    layout.registry = registry // array of crawl-cf pairings
    layout.register = function( cf, crawl ){
        // register a crossfilter to a particular crawl or create the crawl
        // this will note when data is added and fire off a response 
        if( !crawl ) { // create it
                // TODO - don't have the parent container reference.
                throw "Bad argument: crawl"
        }
        cf.layout = layout // extension to crossfilter
        cf.layout_crawl = crawl
        cf.layout_advance_ready = false
        registry.push(cf)
        // keep track of min of max indicies of cf's. 
        // This is layout index for all streams in combination.
        // third entry is readtoadvance flag (size > layoutmaxindex)
        // bitfield structure would be better/faster?
    
        cf.onChange(eventType =>{
            if(eventType != "dataAdded") return
            console.log(layout)
            console.log(cf.all())
            let advance = cf.size() > layout.datalength
            if (advance > cf.layout_advance_ready){ // true > false
                cf.advance_ready = advance // true
                layout.cfsReady++ // another one ready
            }
            if( layout.cfsReady >= registry.length ){ //=are all cfs ready?
                let sizes = registry.map(cf => cf.size())
                layout.datalength = Math.min(...sizes)
                layout.cfsReady = registry.reduce( 
                    (prev, cf) => {
                                cf.advance_ready = cf.size() > layout.datalength
                                return prev + cf.advance_ready } 
                    ,0)

                layout.onAdvanceCallback(layout) //advance them all?
            }            
    
        })
    }  
    return layout
}

crawlfilter = function(d){
    xf = Object.create(new crossfilter(d))
    return xf
}
