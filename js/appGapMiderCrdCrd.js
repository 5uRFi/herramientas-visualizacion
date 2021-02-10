// -- Configuración del canvas --
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 0.5625 

graf.style('width', `${ancho_total}px`)
    .style('height',`${alto_total}px`)

margins = {top: 30, left:80, right:15, bottom:80}

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
color = d3.scaleOrdinal()
r = d3.scaleLinear()

// -- Variables globales
datos = []
years = []
trimestresRepo = []
trimestresLeyenda = []
idxTrim = []
trimCnt = 0
metricaSelect = d3.select('#metrica')
metricaListDisplay = ['Monto Promedio por Compra', 'Monto Promedio de Compras Autorizadas', 'Porcentaje de Compras Autorizadas']
metricaList = ['MTO_PROM_X_SOLC', 'PROM_CPAS_AUT', 'PORC_CPAS_AUT']
metrica = 'MTO_PROM_X_SOLC'
var corriendo = true
var interval 
var metricaSelectHtml = document.getElementById("metrica");
botonPausa = d3.select('#pauseGraph')

d3.csv('data/OverallCreditCards.csv').then ((data) => {
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
    // -- Llenado de la lista de métricas
    for (let i = 0; i < metricaListDisplay.length; i++) {
        metricaSelect.append('option')
                        .attr('value', metricaList[i])
                        .text(metricaListDisplay[i])
    }
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
    // -- Intervalo para refrescar la pantalla automáticamente
    interval = d3.interval(() => adelante(), 300)
})

function frame () {
    // -- Selección de datos del trimeste y leyenda
    idxTrim = trimestresRepo[trimCnt]
    yrDisplay.text(trimestresLeyenda[trimCnt])
    data = d3.filter(datos, d => d.TRIMESTRE_NUM == idxTrim)
    // -- Ajuste del escalador del radio   
    if (metrica === 'MTO_PROM_X_SOLC' || metrica === 'PROM_CPAS_AUT')
        r.domain([d3.min(datos, d => d.PROM_CPAS_AUT), d3.max(datos, d => d.MTO_PROM_X_SOLC)])
    else
        r.domain([d3.min(datos, d => d.PORC_CPAS_AUT), d3.max(datos, d => d.PORC_CPAS_AUT)])
    switch(metrica) {
        case 'MTO_PROM_X_SOLC':
            r.range([5, 70])
            color.range(["#A93226","#884EA0","#2471A3","#17A589","#229954","#28B463","#D4AC0D","#BA4A00","#717D7E","#2E4053"])
            break;
        case 'PROM_CPAS_AUT':
            r.range([5, 70])
            color.range(["#607D8B","#9E9E9E","#6D4C41","#F4511E","#FFB300","#FDD835","#C0CA33","#43A047","#5E35B1","#E53935"])
            break;
        default:  // 'PORC_CPAS_AUT'
            r.range([5, 35])
            color.range(["#FFCC00","#FF9900","#FF6600","#990000","#996600","#999900","#99CC00","#33CC00","#336600","#330033"])
      }
    render(data)
}

function render (data) {

    metricaSelectHtml = document.getElementById("metrica");

    renderLabels()

    p = g.selectAll('circle')
            .data(data, d => d.ENTIDAD)
    p.enter()
            //.transition().duration(1000)
            .append('circle') 
            .attr('cx', d => x(d.NRO_SOLS_CPA))
            .attr('cy', d => y(d.MTO_SOLS_CPA))
            .attr('r', 0)
            .on("mouseover", mouseHoverOn)
            .on("mouseout", mouseHoverOff)
        .merge(p)
            .transition().duration(1000)
            .attr('cx', d => x(d.NRO_SOLS_CPA))
            .attr('cy', d => y(d.MTO_SOLS_CPA))
            .attr('r', d => r(d[metrica]))
            .attr('fill', d => color(d.ENTIDAD))
    p.exit()
        .remove()
}

//agrega cuadro con descripción a etiquetas
function renderLabels(){
    g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 160)
    .attr('height', 350)
    .attr('stroke', 'black')
    .attr('fill', '#dedede')

    color.domain().forEach((d, i) => {
        g.append('rect')
        .attr('x', 10)
        .attr('y', 5 + i*35)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', color(d))

        g.append('text')
        .attr('x', 40)
        .attr('y', 20+ i*35)
        .attr('fill', 'black')
        .text(d[0].toUpperCase() + d.slice(1))
    })
}

function atras() {    
    ((trimCnt - 1) < 0) ? trimCnt = 0 : trimCnt --
    frame()
}

function adelante() {
    ((trimCnt + 1) > trimestresRepo.length - 1) ? trimCnt = 0 : trimCnt ++
    frame()
}

botonPausa.on('click', () => {
    corriendo = !corriendo    
    if (corriendo) {
        image = document.getElementById('pauseGraph')
        image.src = 'img/small_1x_pause.png'
        interval = d3.interval(() => adelante(), 300)
    } else {
        image = document.getElementById('pauseGraph')
        image.src = 'img/small_1x_play.png'
        interval.stop()
    }
})


metricaSelect.on('change', () => {
    metrica = metricaSelect.node().value
    frame()
})

//Handling mouse hover functionality
var mouseHoverOn = function() {
    //change the opacity of background
    p.style("opacity",.2)
    var circle = d3.select(this);

    //highlight the hovered circle by changing the opacity
    circle.transition()
            .duration(10).style("opacity", 0.9)
    circle.append("title")
            .text(function(d) {
            var valMetrica
            var textMetrica
            if(metrica == 'MTO_PROM_X_SOLC'){
                valMetrica = d.MTO_PROM_X_SOLC
                textMetrica = 'Monto Promedio por Compra'
            } else if(metrica == 'PROM_CPAS_AUT'){
                valMetrica = d.PROM_CPAS_AUT
                textMetrica = 'Monto Promedio de Compras Autorizadas'
            } else if(metrica == 'PORC_CPAS_AUT'){
                valMetrica = d.PORC_CPAS_AUT
                textMetrica = 'Porcentaje de Compras Autorizadas'
            }
            console.log('metricaSelect'+metrica)
            return textMetrica + ': ' + valMetrica + '\n\nNúmero de solicitudes: ' + d.NRO_SOLS_CPA + '\nMonto de Solicitudes: ' + d.MTO_SOLS_CPA
        })

        svg.append("g")
            .attr("class", "detailInfo")
            .append("line")
            .attr("x1", circle.attr("cx") )
            .attr("x2", circle.attr("cx"))
            .attr("y1", circle.attr("cy"))
            .attr("y2", alto )
            .attr("transform", "translate(80,30)")
            .style("stroke", "black")
            .transition().delay(200).duration(450).styleTween("opacity",
                                                                function() {
                                                                    return d3.interpolate(1, .5);
                                                                })
        svg.append("g")
            .attr("class","detailInfo")
            .append("line")
            .attr("y1", circle.attr("cy"))
            .attr("y2", circle.attr("cy"))
            .attr("x1", circle.attr("cx"))
            .attr("x2", 0)
            .attr("transform", "translate(80,30)")
            .style("stroke", "black")
            .transition().delay(200).duration(450).styleTween("opacity",
                                                            function() {
                                                                return d3.interpolate(1, .5);
                                                            })
}

//Remove the opacity effect and make all circle visible
var mouseHoverOff = function() {
    p.style("opacity",0.9)
    var circle = d3.select(this);
    d3.selectAll(".detailInfo").transition()
                    .duration(10).styleTween("opacity", function() {
                        return d3.interpolate(.5, 1);
                    })
    .remove()
}