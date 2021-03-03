// set the dmensions and margins of the graph
graf = d3.select('#my_dataviz')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
var margin = {
  top: 30,
  left: 70,
  right: 15,
  bottom: 20
},
width = ancho_total - margin.left - margin.right,
height  = alto_total - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", `${ ancho_total }px`)
    .attr("height", `${ alto_total }px`)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
          .attr('width', width + 'px')
          .attr('height', height + 'px')

// Se leen los datos
d3.csv('data/NumberOfCC.csv', function(data) {
    parser = d3.timeParse(d3.timeParse('%Y/%m/%d'))
    data.forEach(d => {
        d.trimester = parser(d.trimester);
        d.noCards = + d.noCards;
    })

    // Group the data: I want to draw one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.brand;})
        .entries(data);        

    // Add X axis 
    var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.trimester))
            .range([ 0, width]);
    svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                    .ticks(5)
                    .tickFormat(d3.timeFormat("%Y-%m")));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d.noCards; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Color scalator
    var res = sumstat.map(function(d){ return d.key }) // list of group names
    var color = d3.scaleOrdinal()
      .domain(res)
      .range(d3.schemePaired)

    // Draw the line
    svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
          .attr("fill", "none")
          .attr("stroke", function(d){ return color(d.key) })
          .attr("stroke-width", 1.5)
          .attr("d", function(d){
            return d3.line()
              .x(function(d) { return x(d.trimester); })
              .y(function(d) { return y(+d.noCards); })
            (d.values)
          })
    console.log("Lineas")

    var i = 1
    sumstat.forEach ((d, i) => {
        svg.append('rect')
            .attr('x', ((ancho_total/6) * 5) - 15)
            .attr('y', (i*15) - 3)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', color(d.key))
        svg.append('text')
            .attr('x', (ancho_total/6) * 5)
            .attr('y', 4 + (i*15))
            .attr('text-anchor', 'start')
            .attr("font-family", "sans-serif")
            .style("font-size", 9)        
            .attr('fill', 'grey')
            .text(d.key)
      })
})
