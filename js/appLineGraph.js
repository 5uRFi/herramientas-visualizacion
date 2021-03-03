$( document ).ready(function() {
        console.log( "ready!" );
        load(entidadFinanciera);

        //document.getElementById("banco").style.display = "none"; 
        //$('#banco').hide();
        //$('.banco').hide()
});


graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
var margins = {
  top: 30,
  left: 70,
  right: 15,
  bottom: 20
}
ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// Area total de visualización
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

// Contenedor "interno" donde van a estar los gráficos
g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

        titulo =   g.append('text')
        .attr('x', `${ancho / 2}px`)
        .attr('y', '-5px')
        .attr('text-anchor', 'middle')
        .attr('class', 'tituloGrafica')
        .attr('id', 'titulo-graf')

container = document.getElementById("titulo-graf");

var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none")

focus.append("line")
        .attr("class", "y-hover-line hover-line")
focus.append("line")
        .attr("class", "x-hover-line hover-line")

focus.append("circle")
        .attr("r", 7.5)

focus.append("text")
        .attr("x", 15)
      	.attr("dy", ".31em");

/*tooltip
var tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("display", "none");

var tooltipDate = tooltip.append("div")
.attr("class", "tooltip-date");

var tooltipLikes = tooltip.append("div");
tooltipLikes.append("span")
.attr("class", "tooltip-title")
.text("Likes: ");

var tooltipLikesValue = tooltipLikes.append("span")
.attr("class", "tooltip-likes");
*/

svg.append("rect")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        // .attr("class", "overlay")
        .attr('fill', 'white')
        .attr('fill-opacity', 0.05)
        .attr("width", ancho)
        .attr("height", alto)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", e => mousemove(e))

        /*tooltip
        .on("mouseover", function() { focus.style("display", null); tooltip.style("display", null);  })
        .on("mouseout", function() { focus.style("display", "none"); tooltip.style("display", "none"); })
        tooltip*/


// Variables Global_Objects
var entidadFinanciera = "TarjetasBanamex"

// Escaladores
x = d3.scaleTime().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
color = d3.scaleOrdinal()
          .domain(['TarjetasBanamex', 'BBVABancomer', 'HSBC', 'BancoDelBajio', 'BancaMifel', 'Scotiabank', 'Banregio', 'Invex', 'Afirme', 'BanorteIxe', 'AmericanExpress', 'BancoAzteca', 'BancoAhorroFamsa', 'BanCoppel', 'Consubanco', 'Globalcard', 'SantanderConsumo', 'CFCreditServices'])
          .range(d3.schemePaired)

// Ejes
xAxisCall = d3.axisBottom()
xAxis = g.append('g')
          .attr('class', 'ejes')
          .attr('transform', `translate(0, ${alto})`)
yAxisCall = d3.axisLeft()
yAxis = g.append('g')
          .attr('class', 'ejes')

// Generador de líneas
lineaGen = d3.line()
              .x(d => x(d.Trimestre))
              .y(d => y(d[entidadFinanciera]))
linea = g.append('path')

var data

parser = d3.timeParse(d3.timeParse('%Y-%m-%d'))
parserOne = d3.timeParse(d3.timeParse('%Y-%m-%d'))
var formatYMD = d3.timeFormat('%Y-%m-%d')
formatValue = d3.format(",")
var bisectDate = d3.bisector((d) => d.Trimestre).left
var startTitulo = "Tarjetas de crédito activas - "

function load() {
  d3.csv('data/MxOverallNumCards.csv').then(data => {
    data.forEach(d => {
      d[entidadFinanciera] = + d[entidadFinanciera]
      d.Trimestre = parser(d.Trimestre)
      // d.Total = + d.Total
    })
    console.log("load"+entidadFinanciera)
    x.domain(d3.extent(data, d => d.Trimestre))
    y.domain([
        d3.min(data, d => d[entidadFinanciera]) * 0.95,
        d3.max(data, d => d[entidadFinanciera]) * 1.05
    ])

    // Ejes
    xAxis.transition()
          .duration(500)
          .call(xAxisCall.scale(x))
    yAxis.transition()
          .duration(500)
          .call(yAxisCall.scale(y))

    this.data = data
    
    render(data)
  }).catch (e => {
    console.log('No se tuvo acceso al archivo: ' + e.message)
    })

    
}

function render(data) {
    linea.attr('fill', 'none')
        .attr('stroke-width', 3)
        .transition()
        .duration(500)
        .attr('stroke', color(entidadFinanciera))
        .attr('d', lineaGen(data))   

    newContent = startTitulo + entidadFinanciera;
    // Update titulo de grafica
    container.innerHTML = newContent;
}

load(entidadFinanciera);

function cambio() {
  entidadFinanciera = d3.select('#banco').node().value
  load(entidadFinanciera)
   
}

function mousemove(e) {
        // console.log(`${d3.pointer(e)}`)
      
        // Este artículo explica bien que es un bisector y la
        // filosofía tras el:
        // https://stackoverflow.com/questions/26882631/d3-what-is-a-bisector

        x0 = x.invert(d3.pointer(e)[0])
        //bisectDate = d3.bisector((d) => d.Trimestre).left
        i = bisectDate(data, x0, 1)
        //console.log(`${x0} = ${i}`)

        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.Trimestre > d1.Trimestre - x0 ? d1 : d0;
        
        focus.attr("transform", "translate(" + x(d.Trimestre) + "," + y(d[entidadFinanciera]) + ")");
        focus.select("text").text(function() { return "Solicitudes:"+formatValue(d[entidadFinanciera])+" - "+ "Trimestre:"+ formatYMD(d.Trimestre)});
        focus.select(".x-hover-line").attr("x2", -x(d.Trimestre));
        focus.select(".y-hover-line").attr("y2", alto - y(d[entidadFinanciera]));

        /*tooltip
        tooltip.attr("style", "left:" + (x(d.Trimestre) + 64) + "px;top:" + y(d[entidadFinanciera]) + "px;");;
        tooltip.select(".tooltip-date").text("HOLA");
        tooltip.select(".tooltip-likes").text("MUNDO");
        */
      }

