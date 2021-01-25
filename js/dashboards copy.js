// Configuración del canvas
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16 

graf.style('width', `${ancho_total}px`)
    .style('height',`${alto_total}px`)

margins = {top: 50, left:50, right:15, bottom:50}

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom
    
// Variables global, incluye datos
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height',`${ alto_total }px`)

g =  svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', `${ancho}px`)
        .attr('height', `${alto}px`)

// -- Escaladores --
y = d3.scaleLinear()
      .range([alto, 0])

x = d3.scaleBand()
      .range([0, ancho])
      .paddingInner(0.1)
      .paddingOuter(0.1)


color = d3.scaleOrdinal()
          .range(d3.schemeDark2)

// -- Grupos/capas ---

//yAxGroup = g.append('g')

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')


/////////////////////inicia one////////////////////////77

// (1) Variables globales para determinar que mostrar y
//     poder obtener los datos del select
comboAnios = 'todas'
anioSelect = d3.select('#anio')

metrica = 'solicitudes'
metricaSelect = d3.select('#metrica')

ascendente = false

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

titulo = g.append('text')
          .attr('x', `${ancho / 2}px`)
          .attr('y', '-5px')
          .attr('text-anchor', 'middle')
          .text('Analisis por banco y ' + metrica + ' en tarjetas de debito')
          .attr('class', 'titulo-grafica')

dataArray = []


///////termina one///////

// Render de la gráfica
/*
function render(data) {
    bars =  g.selectAll('rect')
             .data(data)
    bars.enter()
        .append('rect')
        .style('width', d => `${x.bandwidth()}px`)
        .style('height', d => `${alto - y(d.solicitudes)}px`)
        .style('x', d => `${(x(d.solicitudes))}px`)
        .style('y', d => `${(y(d.solicitudes))}px`)
        .style('fill', d => color(d.anio))  
    yAxCall = d3.axisLeft(y)
    yAxisGroup.call(yAxCall)   
}
*/

function render(data) {
    // function(d, i) { return d }
    // (d, i) => d
  
    bars = g.selectAll('rect')
              .data(data, d => d.banco)
  
    bars.enter()
        .append('rect')
          .style('width', '0px')
          .style('height', '0px')
          .style('y', `${y(0)}px`)
          .style('fill', '#000')
          .style('x', d => x(d.banco) + 'px')
        .merge(bars)
          .transition()
          // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe
          // .ease(d3.easeElastic)
          .duration(2000)
            .style('x', d => x(d.banco) + 'px')
            .style('y', d => (y(d[metrica])) + 'px')
            .style('height', d => (alto - y(d[metrica])) + 'px')
            .style('fill', d => color(d.banco))
            .style('width', d => `${x.bandwidth()}px`)
  
    bars.exit()
        .transition()
        .duration(2000)
          .style('height', '0px')
          .style('y', d => `${y(0)}px`)
          .style('fill', '#000000')
        .remove()
  
  
    yAxisCall = d3.axisLeft(y)
                  .ticks(3)
                  .tickFormat(d => d + ((metrica == 'monto') ? 'm.' : ''))
    yAxisGroup.transition()
              .duration(2000)
              .call(yAxisCall)
  
    xAxisCall = d3.axisBottom(x)
    xAxisGroup.transition()
              .duration(2000)
              .call(xAxisCall)
              .selectAll('text')
              .attr('x', '0px')
              .attr('y', '10px')
              .attr('text-anchor', 'middle')
              //.attr('transform', 'rotate(-90)')

              
  }

// Carga de datos - los montos se escalan a miles de millones y el nro de opns a miles
d3.csv('/data/DatasetTarjetasDebito.csv').then(function (data) {
    console.log(data)
    data.forEach(d => {
        d.anio =+ d.anio
        d.monto =+ d.monto/1000000000
        d.solicitudes =+ d.solicitudes/1000
    })
    this.dataArray = data

    anioCombo = data.map(d => d.anio)
    distinctYears = new Set(anioCombo);

    anioSelect.append('option')
              .attr('value', 'todas')
              .text('Todas')

    distinctYears.forEach(d => {
    anioSelect.append('option')
                .attr('value', d)
                .text(d)})

    // V. Despliegue
    frame()

    // Asignación de dominio de los escaladores
    //nroSolsMax = d3.max(data, d => d.solicitudes)
    //y.domain([0, nroSolsMax])
    //x.domain(data.map(d => d.solicitudes))
    //render(dataArray)
}).catch(e => {
    console.log('No se tuvo acceso al archivo: ' + e.message)
})


function frame() {

    dataframe = dataArray
    if (comboAnios != 'todas') {
      console.log("anios"+comboAnios)
      dataframe = d3.filter(dataArray, d => d.anio == comboAnios)
    }
  
    //dataframe.sort((a, b) => {
     // return ascendente ? d3.ascending(a[metrica], b[metrica]) : d3.descending(a[metrica], b[metrica])
      //
      // Es equivalente a...
      //
      // return ascendente ? a[metrica] - b[metrica] : b[metrica] - a[metrica]
    //})
  
    
    // Calculaar la altura más alta dentro de
    // los datos
    console.log("metrica"+metrica)
    nroSolsMax = d3.max(dataframe, d => d[metrica])
    console.log("max"+nroSolsMax)
    // Creamos una función para calcular la altura
    // de las barras y que quepan en nuestro canvas
    y.domain([0, nroSolsMax])
    x.domain(dataframe.map(d => d.banco))

    //nroSolsMax = d3.max(data, d => d.solicitudes)
    //y.domain([0, nroSolsMax])
    //x.domain(data.map(d => d.solicitudes))
    //x.domain(dataframe.map(d => d.solicitudes))
    //render(dataArray)
  
    render(dataframe)
}

anioSelect.on('change', () => {
    comboAnios = anioSelect.node().value
    frame()
})

metricaSelect.on('change', () => {
    metrica = metricaSelect.node().value
    frame()
})

function cambiaOrden() {
    ascendente = !ascendente
    frame()
}
