// -- Configuración del canvas --
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 0.5625 

graf.style('width', `${ancho_total}px`)
    .style('height',`${alto_total}px`)

margins = {top: 30, left:50, right:15, bottom:120}

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

yrDisplay = g.append('text')
                .attr('x', ancho/2)
                .attr('y', alto/2 + 100)
                .attr('text-anchor', 'middle')
                .attr('font-family', 'Arial')
                .attr('font-size', '200px')
                .attr('fill', '#ccccb3')
                .text('2015')

g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', ancho)
    .attr('height', alto)
    .attr('stroke', 'grey')
    .attr('fill', 'none')

// -- Escaladores Inicio
x = d3.scaleLinear().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
color = d3.scaleOrdinal().range(d3.schemePaired)
r = d3.scaleLinear()

// -- Variables globales
datos = []
years = []
periodosRepo = []

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
    periodosRepo = Array.from(new Set(d3.map(data, d => d.TRIMESTRE_NUM)))
    console.log(periodosRepo)
    x.domain([d3.min(data, d => d.NRO_SOLS_CPA), d3.max(data, d => d.NRO_SOLS_CPA)])
    y.domain([d3.min(data, d => d.MTO_SOLS_CPA), d3.max(data, d => d.MTO_SOLS_CPA)])
    r.domain([d3.min(data, d => d.PORC_CPAS_AUT), d3.max(data, d => d.PORC_CPAS_AUT)])
    datos = data
    frame()
})

function frame () {
    render()
}

function render () {
    bubbles = g.selectAll('circle')
                .data(datos)
    bubbles.enter()
            .append('circle')
            .attr('cx', d => x(d.NRO_SOLS_CPA))
            .attr('cy', d => y(d.MTO_SOLS_CPA))
            .attr('r', d => r(d.PORC_CPAS_AUT) * 18)
            .attr('fill', d => color(d.ENTIDAD))
}