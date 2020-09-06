/*
This is code for a woff/woff2 viewer.
It was meant as a quick solution to a problem i had.
Therefore, the code is quick and dirty. 
This is licensed under the MIT license, 
so if you want to make a version of this
whose code doesn't smell, feel free.
*/

(function WoffViewer(){

  var dropArea = document.getElementById("dropArea");
  var inputElement = document.getElementsByName("fileDiag")[0];
  var unicodeRangeMenu = document.getElementById("unicodeRangeMenuFunc");
  var unicodeNameMenu = document.getElementById("unicodeNameMenuFunc");
  var unicodeRangePanel = document.getElementById("rangeSelector");
  var unicodeNamePanel = document.getElementById("nameSearch");
  var reader = new FileReader();
  var font;
  var unicodeData;
  var unicodeRanges;
  var rangeSearchTerm = "";
  var filename = "Arial";

  var MODE = {
    RANGE: 0,
    SEARCHTERM: 1
  }

  var selectedCodes = [];

  var range = {
    lo: 32,
    hi: 127
  };

  var displayMode = MODE.RANGE;


  var loRangeInput = document.getElementsByName("lo_code")[0];
  var hiRangeInput = document.getElementsByName("hi_code")[0];

  function showBackToTop(){
    document.getElementById("backToTop").classList.remove("hidden");
    window.removeEventListener("scroll", showBackToTop);
  }

  function navBackToTop(e){
    window.scrollTo(0,0);
    document.getElementById("backToTop").classList.add("hidden");
    window.addEventListener("scroll", showBackToTop);
  }

  navBackToTop();

  document.getElementById("backToTop").addEventListener("click", navBackToTop)

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
    data['ASCII (Non-control)'] = {lo:32, hi:127};
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
      selectedCodes.forEach((code)=>{
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
        document.createTextNode("U+"+(parseInt(i).toString(16).toUpperCase().padStart(4,"0")))
      );

      gc.appendChild(glyphComponent);
  }

  function setRanges(){
    var rangeSelector = document.getElementsByName("rangeSelector")[0];

    var keys = Object.keys(unicodeRanges);

    if (rangeSearchTerm.length > 0){
      keys = keys.filter((str)=>{
        return str.toLowerCase().includes(rangeSearchTerm.toLowerCase());
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

  function doSearch(term){
    selectedCodes = [];
    //"iterate over all (?) descriptions to find things that match"
    for (const [key,value] of Object.entries(unicodeData)){
      if (value.toLowerCase().includes(term.toLowerCase())){
        selectedCodes.push(key);
      }
    }
    clearGlyphContainer();
    populateGlyphs()
  }

  function clearSearch(){
    selectedCodes = [];

    clearGlyphContainer();
    populateGlyphs()
  }

  function setupRangeSelector(){
    var rangeSelector = document.getElementsByName("rangeSelector")[0];
    var rangeSelectorSearch = document.getElementsByName("rangeSelectorSearch")[0];
    var codeSearch = document.getElementsByName("nameSearch")[0];

    setRanges();

    rangeSelectorSearch.removeAttribute("disabled");
    codeSearch.removeAttribute("disabled");

    codeSearch.addEventListener("keyup", (e)=>{
      e.preventDefault();
      if (e.target.value.length > 1){
        doSearch(e.target.value);
      } else {
        clearSearch();
      }
    });

    rangeSelectorSearch.addEventListener("keyup", (e)=>{
      rangeSearchTerm = e.target.value;
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
        loadedFont.appendChild(document.createTextNode("Error: not a font"));
      });
    });

    unicodeNameMenu.addEventListener("click", ()=>{
      unicodeNameMenu.classList.add("selected");
      unicodeRangeMenu.classList.remove("selected");

      unicodeRangePanel.classList.add("hidden");
      unicodeNamePanel.classList.remove("hidden");

      displayMode = MODE.SEARCHTERM;
      clearGlyphContainer();
      populateGlyphs();
    });

    unicodeRangeMenu.addEventListener("click", ()=>{
      unicodeNameMenu.classList.remove("selected");
      unicodeRangeMenu.classList.add("selected");

      unicodeRangePanel.classList.remove("hidden");
      unicodeNamePanel.classList.add("hidden");

      displayMode = MODE.RANGE;

      clearGlyphContainer();
      populateGlyphs();
    });

    inputElement.addEventListener("change", (e)=>{
      filename = e.target.files[0].name;
      reader.readAsDataURL(e.target.files[0]);
    });

    dropArea.addEventListener("dragover", (e)=>{
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