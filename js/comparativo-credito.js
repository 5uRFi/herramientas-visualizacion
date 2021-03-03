$("#selector").on("change", () => {
    var select = $("#selector").val()
    console.log("valorSelect AQUIIII"+select)
    switch (select) {
        case "porBanco":
          $("#porBanco").css("display","inline-block")
          //$('#porBanco').show(); 
          $("#todos").css("display","none")
          //$('#todos').hide(); 
          console.log("habilitando porBanco")
          document.getElementById("frameBanco").contentDocument.location.reload(true);
        break;
        case "todos":
          $("#todos").css("display","inline-block")
          //$('#todos').show(); 
          $("#porBanco").css("display","none")
          //$('#porBanco').hide(); 
          console.log("habilitando todos")
          document.getElementById("frameTodos").contentDocument.location.reload(true);location.reload();
        break;
    }
  })