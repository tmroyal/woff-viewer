(function WoffViewer(){
  var dropArea = document.getElementById("dropArea");
  var reader = new FileReader();
  var font;

  reader.addEventListener("load", (f)=>{
    font = new FontFace("loadedFont", 'url('+reader.result+')');
    font.load().then(()=>{
      document.fonts.add(font);
    });
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
      }
    } else {
        reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  }, false);

})();