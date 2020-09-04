(function WoffViewer(){
  var dropArea = document.getElementById("dropArea");
  var reader = new FileReader();
  var font;
  var unicodeData;
  var unicodeRanges;
  var searchTerm = "";
  var filename = "Arial";

  var MODE = {
    RANGE: 0,
    SELECTED_CODES: 1
  }

  var range = {
    lo: 32,
    hi: 127
  };

  var selectedCodes = [];
  var displayMode = MODE.RANGE;

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
    data.ASCII = {lo:32, hi:127};
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
    if (displayMode == MODE.RANGE){
      for (let i = range.lo; i < range.hi; i++){
        populateSingleGlyph(i);
      }
    } else {
      selectedCodes.forEach(code,()=>{
        populateSingleGlyph(code);
      });
    }
  }

  function populateSingleGlyph(i){
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

  function setRanges(){
    var rangeSelector = document.getElementsByName("rangeSelector")[0];

    var keys = Object.keys(unicodeRanges);

    if (searchTerm.length > 0){
      keys = keys.filter((str)=>{
        return str.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    keys.sort();

    // seems fast enough
    rangeSelector.innerHTML = "";

    keys.forEach((rangeName)=>{
      var option = document.createElement("option");
      option.appendChild(document.createTextNode(rangeName));
      option.value = rangeName;
      rangeSelector.appendChild(option);
    });

    if (keys.length > 0){
      rangeSelector.dispatchEvent(new Event('change'));
    } else {
      range.lo = -1;
      range.hi = -1;
      clearGlyphContainer();
      populateGlyphs();
    }
  }

  function setupRangeSelector(){
    var rangeSelector = document.getElementsByName("rangeSelector")[0];
    var rangeSelectorSearch = document.getElementsByName("rangeSelectorSearch")[0];

    setRanges();

    rangeSelectorSearch.removeAttribute("disabled");

    rangeSelectorSearch.addEventListener("keyup", (e)=>{
      searchTerm = e.target.value;
      setRanges();
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
      var loadedFont = document.getElementById("loadedFont");
      while (loadedFont.firstChild){ 
        loadedFont.removeChild(loadedFont.firstChild);
      }

      font = new FontFace("loadedFont", 'url('+reader.result+')');

      font.load().then(()=>{
        document.fonts.add(font);
        clearGlyphContainer();
        populateGlyphs();
        loadedFont.appendChild(document.createTextNode(`Font: ${filename}`));
      })
      .catch(()=>{
        console.log(loadedFont);
        loadedFont.appendChild(document.createTextNode("Error: not a font"));
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
          var file;
          file = e.dataTransfer.items[0].getAsFile();
          filename = file.name;
          reader.readAsDataURL(file);
        }
      } else {
          filename = e.dataTransfer.files[0].name;
          reader.readAsDataURL(e.dataTransfer.files[0]);
      }
    }, false);
  }
  
})();