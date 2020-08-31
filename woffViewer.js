(function WoffViewer(){
  var dropArea = document.getElementById("dropArea");
  var reader = new FileReader();

  console.log(dropArea);

  reader.addEventListener("load", (f)=>{
    console.log(reader.result);
  });

  dropArea.addEventListener("dragover", (e)=>{
    dropArea.className = "dropArea2"
    e.preventDefault();
  }, false);

  dropArea.addEventListener("drop", (e)=>{
    e.preventDefault();
    
    if (e.dataTransfer.items) {
      if (e.dataTransfer.items[0].kind === 'file') {
        var file = e.dataTransfer.items[0].getAsFile();
        reader.readAsDataURL(file);
        console.log(file);
      }
    } else {
        console.log(e.dataTransfer.files[0]);
        reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  }, false);

})();