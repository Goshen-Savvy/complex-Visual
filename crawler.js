
// define the crawler component
function crawler([width, height], indexpoints = 20) {

    let inside_nodes = []
    let inside_g // empty selection? 
    let indexlength = width / indexpoints // distance between ticks
    // let outside_g
    function crawl(selection) {
        let outside = selection.append("g")
            .attr("class", "crawlbox")
        let clipid = `clip${width}x${height}`
        let crawlRect = outside
            .append("rect")
            .attr("class", "crawlBoxRect")
            .attr("width", width)
            .attr("height", height)
            .style("display", "none");

        outside
            .append("defs")
            .append("clipPath")
            .attr("id", clipid)
            .append("rect")
            .attr("width", width)
            .attr("height", height);
        let inside = outside.append("g")
            .attr("clip-path", `url(#${clipid})`)
            .append("g")
            .attr("class", "crawler")

        // add this group to my selection of controlled groups
        inside_nodes.push(inside.node())
        inside_g = d3.selectAll(inside_nodes)

        inside.crawlEnclosure = outside // added to selection object
        inside.crawlRect = crawlRect // added to selection object
        inside.transform = tf => outside.attr("transform", tf) // added to selection object
        crawl.reset() // depends on inside_g being set
        return inside
    } 

    let tickcount = 0;
    function settrans(selection) {
        selection.attr("transform", `translate(${width - tickcount * indexlength},0)`)
    }

    // bounds of the translated clipped region in its own co-ordinates
    // nb this won;t be valid during transitions - almost always??? 
    // sine we are transitioning to this region - same for all .
    crawl.bounds = function(){
        return [tickcount * indexlength - width, tickcount * indexlength ]
    }
    // can we get the actual transform value? during transitions?

    crawl.cycle = function (duration = 1750) {
        function cycler() {
            tickcount++;
            d3.active(this)
                .call(settrans)
                .transition().on("start", cycler)
        }
        inside_g.transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .on("start", cycler)
    }

    crawl.stop = function () {
        //d3.interrupt(inside_g.node()) // need to get interrupt working?
        inside_g.interrupt()
        settrans(inside_g)
    }

    // advance to this point in a single transformation, for smooth single stepping
    
/** TODO: tick/index points should be index configurable to match the number
    of points requested. this could speed up the cycling as well with fewer calls 
*/
    crawl.crawlto = function(index, duration = 1750) {
        if(index < tickcount) return ; // can't reverse at the moment

        let allduration = duration*Math.abs(index-tickcount) // this is a const per crawler
        console.log(allduration)
        tickcount = index

        inside_g.transition()
            .duration(allduration)
            .ease(d3.easeLinear)
            .call(settrans)
    }

    crawl.reset = function (clock = 0) {
        tickcount = clock
        settrans(inside_g)
    }
    return crawl
}


