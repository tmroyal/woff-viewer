(function WoffViewer(){
  var dropArea = document.getElementById("dropArea");
  var reader = new FileReader();
  var font;

  reader.addEventListener("load", (f)=>{
    font = new FontFace("loadedFont", 'url('+reader.result+')');
    font.load().then(()=>{
      document.fonts.add(font);
      clearGlyphContainer();
      populateGlyphs();
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

  var gc = document.getElementById("glyphContainer");

  function clearGlyphContainer(){

    while(gc.firstChild){
      gc.removeChild(gc.firstChild);
    }
  }

  var el = document.getElementById("glyphTemplate");

  function populateGlyphs(){
    for (let i = 32; i < 256; i++){
      var glyphComponent = el.cloneNode(true);
      var text = document.createTextNode(String.fromCodePoint(i));
      glyphComponent.id = "";

      var glyphDisplay = glyphComponent.getElementsByClassName("glyphDisplay")[0];
      glyphDisplay.appendChild(text);

      var aGlyphDisplay = glyphComponent.getElementsByClassName("arialGlyphDisplay")[0];
      aGlyphDisplay.appendChild(text.cloneNode());

      var codeDisplay = glyphComponent.getElementsByClassName("codeDisplay")[0];
      codeDisplay.appendChild(
        document.createTextNode("0x"+(i.toString(16).padStart(4,"0")))
      );

      gc.appendChild(glyphComponent);

    }
  }

  populateGlyphs();
  
})();