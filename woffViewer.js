(function WoffViewer(){
  var dropArea = document.getElementById("dropArea");
  var reader = new FileReader();
  var font;
  var unicodeData;
  var unicodeRanges;

  var range = {
    lo: 32,
    hi: 127
  };

  var loRangeInput = document.getElementsByName("lo_code")[0];
  var hiRangeInput = document.getElementsByName("hi_code")[0];

  function showBackToTop(){
    document.getElementById("backToTop").classList.remove("hidden");
    window.removeEventListener("scroll", showBackToTop);
  }

  function navBackToTop(){
    window.scrollTo(0,0);
    document.getElementById("backToTop").classList.add("hidden");
    window.addEventListener("scroll", showBackToTop);
  }

  navBackToTop();

  fetch("unicodeNames.json")
  .then((resp)=>{
    return resp.json();
  })
  .then((data)=>{
    unicodeData = data;
    setupEventListeners();
    populateGlyphs();
  });

  fetch("unicodeRanges.json")
  .then((resp)=>{
    return (resp.json());
  })
  .then((data)=>{
    unicodeRanges = data;
    setupRangeSelector();
  });

  var gc = document.getElementById("glyphContainer");

  function clearGlyphContainer(){
    while(gc.firstChild){
      gc.removeChild(gc.firstChild);
    }
  }

  var el = document.getElementById("glyphTemplate");

  function populateGlyphs(){
    for (let i = range.lo; i < range.hi; i++){
      var glyphComponent = el.cloneNode(true);
      var glyph = document.createTextNode(String.fromCodePoint(i));
      glyphComponent.id = "";

      var glyphDisplay = glyphComponent.getElementsByClassName("glyphDisplay")[0];
      glyphDisplay.appendChild(glyph);

      var glyphTitleDisplay = glyphComponent.getElementsByClassName("glyphTitleDisplay")[0];
      var glyphTitle = document.createTextNode(unicodeData[i]);
      glyphTitleDisplay.appendChild(glyphTitle);

      var codeDisplay = glyphComponent.getElementsByClassName("codeDisplay")[0];
      codeDisplay.appendChild(
        document.createTextNode("U+"+(i.toString(16).padStart(4,"0")))
      );

      gc.appendChild(glyphComponent);

    }
  }

  function setupRangeSelector(){
    var rangeSelector = document.getElementsByName("rangeSelector")[0];
    Object.keys(unicodeRanges).forEach((rangeName)=>{
      var option = document.createElement("option");
      option.appendChild(document.createTextNode(rangeName));
      option.value = rangeName;
      rangeSelector.appendChild(option);
    });

    rangeSelector.addEventListener("change", (e)=>{
      var selectedRange = unicodeRanges[e.target.value];
      range.lo = selectedRange.lo;
      range.hi = selectedRange.hi;

      clearGlyphContainer();
      populateGlyphs();
    });
  }

  function setupEventListeners(){

    reader.addEventListener("load", (f)=>{
      font = new FontFace("loadedFont", 'url('+reader.result+')');
      font.load().then(()=>{
        document.fonts.add(font);
        clearGlyphContainer();
        populateGlyphs();
      });
    });

    dropArea.addEventListener("dragover", (e)=>{
      //dropArea.className = "dropArea2"
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
  }
  
})();