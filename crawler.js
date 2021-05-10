
// define the crawler component
function crawler([width, height], capacity = 100) {

    let inside_nodes = []
    let inside_g // empty selection? 
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
        selection.attr("transform", `translate(${width - tickcount * 10},0)`)
    }

    crawl.cycle = function (duration = 750) {
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
    }

    crawl.reset = function (clock = 0) {
        tickcount = clock
        settrans(inside_g)
    }
    return crawl
}


