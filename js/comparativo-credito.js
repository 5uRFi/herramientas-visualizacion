$("#selector").on("change", () => {
    var select = $("#selector").val()
    console.log(select)
    switch (select) {
        case "banco":
          $("#banco").css("display","inline-block")
        $("#todos").css("display","none")
        break;
        case "todos":
          $("#todos").css("display","inline-block")
        $("#banco").css("display","none")
        break;
    }
  })