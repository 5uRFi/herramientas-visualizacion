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
          .range(d3.schemeTableau10)

// -- Grupos/capas ---
/* xAxGroup = g.append('g')
            .attr('transform', `translate(0, ${ alto })`) */
yAxGroup = g.append('g')

// Render de la gráfica
function render(data) {
    bars =  g.selectAll('rect')
             .data(data)
    bars.enter()
        .append('rect')
        .style('width', d => `${x.bandwidth()}px`)
        .style('height', d => `${alto - y(d.solicitudes)}px`)
        .style('x', d => x(d.solicitudes))
        .style('y', d => `${(y(d.solicitudes))}px`)
        .style('fill', d => color(d.anio))  
    yAxCall = d3.axisLeft(y)
    yAxGroup.call(yAxCall)   
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
    // Asignación de dominio de los escaladores
    nroSolsMax = d3.max(data, d => d.solicitudes)
    y.domain([0, nroSolsMax])
    x.domain(data.map(d => d.solicitudes))
    render(dataArray)
}).catch(e => {
    console.log('No se tuvo acceso al archivo: ' + e.message)
})
