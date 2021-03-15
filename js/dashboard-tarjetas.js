var ewa = null;

// Add event handler for onload event.
if (window.attachEvent) {
    window.attachEvent("onload", ewaOnPageLoad);
}
else {
    window.addEventListener("DOMContentLoaded", ewaOnPageLoad, false);
}

// Add event handler for applicationReady event.
function ewaOnPageLoad() {
    Ewa.EwaControl.add_applicationReady(onApplicationReady);
}


function onApplicationReady(result) {
    ewa = Ewa.EwaControl.getInstances().getItem(0); 
var iframe = document.getElementById('myExcelDiv').children[0];
var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
innerDoc.getElementById("ewaSyndmyExcelDiv_m_ewaEmbedViewerBar").style.display = 'none';
}