$("#selector").on("change", () => {
    var select = $("#selector").val()
    console.log(select)
    switch (select) {
        case "banco":
          $("#banco").css("display","inline-block")
          $("#todos").css("display","none")
          console.log("habilitando banco")
          $.css("display", "");
        break;
        case "todos":
          $("#todos").css("display","inline-block")
          $("#banco").css("display","none")
          console.log("habilitando todos")
        break;
    }
  })