graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
margins = {
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

svg.append("rect")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        // .attr("class", "overlay")
        .attr('fill', 'black')
        .attr('fill-opacity', 0.25)
        .attr("width", ancho)
        .attr("height", alto)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        //.on("mousemove", e => mousemove(e))

focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none")

focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('y2', 0)


focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", ancho);

focus.append("circle")
        .attr("r", 7.5)

focus.append("text")
        .attr("x", 15)
      	.attr("dy", ".31em");

// Escaladores
x = d3.scaleTime().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
// -- Escaladores Continuación

color = d3.scaleOrdinal()
          .domain(['Scotiabank', 'HSBC', 'Banamex', 'Total'])
          .range(['#bb0000', '#00bb00', '#0000bb', '#95a5a6'])

          //color = d3.scaleOrdinal()
          //.range(d3.schemeDark2)

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
              //.x(d => x(d.Trimestre))
              //.y(d => y(d[entidadFinanciera]))
linea = g.append('path')

var data
var entidadFinanciera = "Total"

// parser para fechas
//
// documentación de formato:
// https://d3-wiki.readthedocs.io/zh_CN/master/Time-Formatting/
//
// Documentación de la librería de D3:
// https://github.com/d3/d3-time-format
parser = d3.timeParse(d3.timeParse('%d/%m/%Y'))

/* SE USO EN EL GAP MAINDER EXTRACT CSV
// Carga de datos - los montos se escalan a miles de millones y el nro de opns a miles
d3.csv('data/DatasetTarjetasDebito.csv').then(function (data) {
    data.forEach(d => {        
    d.anio =+ d.anio
    d.monto =+ d.monto/1000000
    d.solicitudes =+ d.solicitudes/1000
})
this.dataArray = data

inicio de los datos para el combo
anioCombo = data.map(d => d.anio)
distinctYears = new Set(anioCombo);
anioSelect.append('option')
          .attr('value', 'todos')
          .text('Todos')
distinctYears.forEach(d => {
anioSelect.append('option')
            .attr('value', d)
            .text(d)})
llenado de datos


// Despliegue
frame()
}).catch (e => {
console.log('No se tuvo acceso al archivo: ' + e.message)
})
*/

function load(symbol='Total') {
  d3.csv('data/MxOverallCards.csv').then(data => {
    data.forEach(d => {
      d.Trimestre = + parser(d.Trimestre)
      d.Banamex = + d.Banamex
      d.Scotiabank = + d.Scotiabank
      d.Total = + d.Total

      //Trimestre,Banamex,BBVABancomer,HSBC,BancodelBajio,BancaMifel,Scotiabank,Banregio,Invex,Afirme,Banorte-Ixe,American Express,Banco Azteca,BancoAhorro Famsa,Actinver,BanCoppel,Consubanco,Globalcard,TarjetasBanamex,SantanderConsumo,CFCreditServices,Total
      //d.indice = +d.indice
      //d.banco = +d.banco
      //d.valor = +d.valor
      //d.trimestre = parser(d.trimestre)

      //Trimestre,Banamex,BBVA Bancomer,HSBC,Banco del Bajio,Banca Mifel,Scotiabank,Banregio,Invex,Afirme,Banorte-Ixe,American Express,Banco Azteca,Banco Ahorro Famsa,Actinver,BanCoppel,Consubanco,Globalcard,Tarjetas Banamex,Santander Consumo,CF Credit Services,Total
    })
    console.log(entidadFinanciera)
    // -- Escaladores Continuación
    //color.domain(d3.map(data, d => d.banco))


    x.domain(d3.extent(data, d => d.Trimestre))
    // Esto es equivalente a...
    // x.domain([d3.min(data, d => d.Date),
    //           d3.max(data, d => d.Date)])

    // y.domain(d3.extent(data, d => d.Close))
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

    render(data, symbol)
  }).catch (e => {
    console.log('No se tuvo acceso al archivo: ' + e.message)
    })
}

function render(data, symbol) {
  linea.attr('fill', 'none')
        .attr('stroke-width', 3)
        .transition()
        .duration(500)
        .attr('stroke', color(symbol))
        .attr('d', lineaGen(data))

  lineaGen.x(d => x(d.Trimestre)).y(d => y(d[entidadFinanciera]))

        console.log(lineaGen)
}

load(entidadFinanciera)

function cambio() {
  entidadFinanciera = d3.select('#stock').node().value
  load(entidadFinanciera)
  console.log(entidadFinanciera)
}


function mousemove(e) {

  // Este artículo explica bien que es un bisector y la
  // https://stackoverflow.com/questions/26882631/d3-what-is-a-bisector

  x0 = x.invert(d3.pointer(e)[0])

  bisectDate = d3.bisector((d) => d.Trimestre).left
  i = bisectDate(data, x0, 1)
  console.log(`${x0} = ${i}`)

  d0 = data[i - 1],
  d1 = data[i],
  d = x0 - d0.Trimestre > d1.Trimestre - x0 ? d1 : d0;

  focus.attr("transform", "translate(" + x(d.Trimestre) + "," + y(d[entidadFinanciera]) + ")");
  focus.select("text").text(function() { return d[entidadFinanciera]; });
  focus.select(".x-hover-line").attr("x2", -x(d.Trimestre))
  focus.select(".y-hover-line").attr("y2", alto - y(d[entidadFinanciera]))
  
}