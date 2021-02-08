// -- Configuración del canvas --
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 0.5625 

graf.style('width', `${ancho_total}px`)
    .style('height',`${alto_total}px`)

margins = {top: 30, left:80, right:15, bottom:120}

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// -- Área total de visualización
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height',`${ alto_total }px`)

// -- Contenedor interno 
g =  svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', `${ancho}px`)
        .attr('height', `${alto}px`)

// -- Letrero del trimestre
fntSize = alto * 0.35
yrDisplay = g.append('text')
                .attr('x', ancho/2)
                .attr('y', alto/2 + 50)
                .attr('text-anchor', 'middle')
                .attr('font-family', 'Arial')
                .attr('font-size', `${fntSize}px`)
                .attr('fill', '#ccccb3')

g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', ancho)
    .attr('height', alto)
    .attr('stroke', 'grey')
    .attr('fill', 'none')

// -- Escaladores Inicio
x = d3.scaleLog().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
color = d3.scaleOrdinal().range(d3.schemePaired)
r = d3.scaleLinear()

// -- Variables globales
datos = []
years = []
trimestresRepo = []
trimestresLeyenda = []
idxTrim = []
trimCnt = 0
metricaSelect = d3.select('#metrica')
metricaListDisplay = ['Monto Promedio por Compra', 'Porcentaje de Compras Autorizadas', 'Monto Promedio de Compras Autorizadas']
metricaList = ['MTO_PROM_X_SOLC', 'PORC_CPAS_AUT', 'PROM_CPAS_AUT']
metrica = ''

d3.csv('/data/OverallCreditCards.csv').then ((data) => {
    data.forEach((d) => {
        d.POSICION =+ d.POSICION
        d.TRIMESTRE_NUM =+ d.TRIMESTRE_NUM
        d.MTO_SOLS_CPA =+ d.MTO_SOLS_CPA
        d.NRO_SOLS_CPA =+ d.NRO_SOLS_CPA
        d.MTO_PROM_X_SOLC =+ d.MTO_PROM_X_SOLC
        d.MTO_CPAS_AUT =+ d.MTO_CPAS_AUT
        d.NRO_CPAS_AUT =+ d.NRO_CPAS_AUT
        d.PROM_CPAS_AUT =+ d.PROM_CPAS_AUT
        d.PORC_CPAS_AUT =+ d.PORC_CPAS_AUT        
    })    
    // -- Escaladores Continuación
    color.domain(d3.map(data, d => d.ENTIDAD))
    // -- Períodos del reporte (se generan con base en el entero del dataset - asociado a la fecha del trimestre)
    trimestresRepo = Array.from(new Set(d3.map(data, d => d.TRIMESTRE_NUM))).sort()
    trimestresLeyenda = Array.from(new Set(d3.map(data, d => d.TRIMESTRE_LEYENDA))).sort()
    x.domain([d3.min(data, d => d.NRO_SOLS_CPA), d3.max(data, d => d.NRO_SOLS_CPA)])
    y.domain([d3.min(data, d => d.MTO_SOLS_CPA), d3.max(data, d => d.MTO_SOLS_CPA)])
    r.domain([d3.min(data, d => d.PORC_CPAS_AUT), d3.max(data, d => d.PORC_CPAS_AUT)])
    /*// -- Selector de métrica
    bancoSelec.append('option')
                .attr('value', 'todos')
                .text('Todos')
    color.domain().forEach(d => {
        bancoSelec.append('option')
        .attr('value', d)
        .text(d)
    })*/
    // -- Configuración de ejes
    xAxis = d3.axisBottom(x)
                .ticks(10)
                .tickFormat(d => d3.format(".2s")(d))
    yAxis = d3.axisLeft(y)
                .ticks(10)
                .tickFormat(d => d3.format(".2s")(d))
    // -- Configuración del grid
    xAxisGrid = d3.axisBottom(x)
                .ticks(10)
                .tickFormat('')
                .tickSize(-alto)
    yAxisGrid = d3.axisLeft(y)
                .ticks(10)
                .tickFormat('')
                .tickSize(-ancho)
    /// -- Inserción ejes y grid
    g.append('g')
        .call(xAxis)
        .attr('transform', `translate(0,${alto})`)
    g.append('g')
        .call(yAxis)
    g.append('g')
        .attr('class', 'ejes')
        .call(xAxisGrid)
        .attr('transform', `translate(0,${alto})`)
    g.append('g')
        .attr('class', 'ejes')
        .call(yAxisGrid)

    // -- Asignación de variable global de datos
    datos = data
    frame()
})

function frame () {
    // -- Selecciónde datos del trimeste y leyenda
    idxTrim = trimestresRepo[trimCnt]
    yrDisplay.text(trimestresLeyenda[trimCnt])
    data = d3.filter(datos, d => d.TRIMESTRE_NUM == idxTrim)
    render(data)
}

function render (data) {
    p = g.selectAll('circle')
            .data(data, d => d.ENTIDAD)
    p.enter()
            .append('circle') 
            .attr('cx', d => x(d.NRO_SOLS_CPA))
            .attr('cy', d => y(d.MTO_SOLS_CPA))
            .attr('r', 0)
        .merge(p)
            .transition().duration(1000)
            .attr('cx', d => x(d.NRO_SOLS_CPA))
            .attr('cy', d => y(d.MTO_SOLS_CPA))
            .attr('r', d => r(d.PORC_CPAS_AUT) * 25)
            .attr('fill', d => color(d.ENTIDAD))
    p.exit()
        .remove()
}

function atras() {    
    ((trimCnt - 1) < 0) ? trimCnt = 0 : trimCnt --
    frame()
}

function adelante() {
    ((trimCnt + 1) > trimestresRepo.length - 1) ? trimCnt = 0 : trimCnt ++
    frame()
}

metricaSelect.on('change', () => {
    metrica = metricaSelect.node().value
    frame()
})