// -- Configuración del canvas --
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16 

graf.style('width', `${ancho_total}px`)
    .style('height',`${alto_total}px`)

margins = {top: 50, left:70, right:15, bottom:50}

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

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

banco = d3.scaleBand()

// -- Grupos/capas --
yAxisGroup = g.append('g')
              .attr('class', 'ejes')

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'ejes')

// -- Variables globales --
comboAnios = 'todos'
anioSelect = d3.select('#anio')

metrica = 'solicitudes'
metricaSelect = d3.select('#metrica')

ascendente = false

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'ejes')
yAxisGroup = g.append('g')
              .attr('class', 'ejes')

dataArray = []

function render(data) {
    console.log("Entro a render")
    if(comboAnios == "todos"){
        console.log(`Años: ${comboAnios}`)
        bars =  g.selectAll('rect')
                 .data(data)
        // Barras
        bars.enter()
            .append('rect')
            .style('width', '0px')
            .style('height', '0px')
            .style('y', `${y(0)}px`)
            .style('fill', '#eaeae1')
            //.style('x', d => x(d.solicitudes) + 'px')
            .style('x', d => x(d[metrica]) + 'px')
            .transition()
            .duration(1500)
                //.style('y', d => `${(y(d.solicitudes))}px`)
                .style('y', d => (y(d[metrica])) + 'px')
                //.style('height', d => `${alto - y(d.solicitudes)}px`)
                .style('height', d => (alto - y(d[metrica])) + 'px')
                .style('fill', d => color(d.anio))
                .style('width', d => `${x.bandwidth()}px`)
        bars.exit()
            /*.transition()
            .duration(1500)
            .style('height', '0px')
            .style('y', d => `${y(0)}px`)
            .style('fill', '#000000') */
            .remove() 
        // Ejes
        yAxCall = d3.axisLeft(y)
                    .tickFormat(d => d + ((metrica == 'monto') ? ' B' : ' m'))
        yAxisGroup.call(yAxCall) 
        banco.domain(data.map(d => d.banco))
            .range([0, ancho])
            .padding([0.2])
        xAxCall = d3.axisBottom(banco)  
        xAxisGroup.call(xAxCall)
                .selectAll('text')
                .attr('x', '0')
                .attr('y', '10')
                .attr('text-anchor', 'middle')
    } else {    
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
            .duration(1500)
                .style('x', d => x(d.banco) + 'px')
                .style('y', d => (y(d[metrica])) + 'px')
                .style('height', d => (alto - y(d[metrica])) + 'px')
                .style('fill', d => color(d.banco))
                .style('width', d => `${x.bandwidth()}px`)    
        bars.exit()
            .transition()
            .duration(1500)
            .style('height', '0px')
            .style('y', d => `${y(0)}px`)
            .style('fill', '#000000')
            .remove()    
        yAxisCall = d3.axisLeft(y)
                    .ticks(3)
                    .tickFormat(d => d + ((metrica == 'monto') ? ' B' : ' m'))
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
    }
  }

// Carga de datos - los montos se escalan a miles de millones y el nro de opns a miles
d3.csv('/data/DatasetTarjetasDebito.csv').then(function (data) {
    // console.log(data)
    data.forEach(d => {
        d.anio =+ d.anio
        d.monto =+ d.monto/1000000
        d.solicitudes =+ d.solicitudes/1000
    })
    this.dataArray = data

    anioCombo = data.map(d => d.anio)
    distinctYears = new Set(anioCombo);
    anioSelect.append('option')
              .attr('value', 'todos')
              .text('Todos')
    distinctYears.forEach(d => {
    anioSelect.append('option')
                .attr('value', d)
                .text(d)})

    // Despliegue
    frame()
}).catch(e => {
    console.log('No se tuvo acceso al archivo: ' + e.message)
})


function frame() {
    dataframe = dataArray
    if (comboAnios != 'todos') {
      console.log(`Un solo año: ${comboAnios}`)
      dataframe = d3.filter(dataArray, d => d.anio == comboAnios)
    }
    
    // Calcular la altura más alta dentro de los datos
    console.log(`Métrica: ${metrica}`)
    nroMax = d3.max(dataframe, d => d[metrica])
    console.log(dataframe)
    // Creamos una función para calcular la altura de las barras y que quepan en nuestro canvas
    y.domain([0, nroMax])
    if(comboAnios == "todos")
        metrica == 'solicitudes' ? x.domain(dataframe.map(d => d.solicitudes)) : x.domain(dataframe.map(d => d.monto))
    else
        x.domain(dataframe.map(d => d.banco))    
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
