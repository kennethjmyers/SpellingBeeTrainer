function appendList(wordList, idToAppend, chkName) {
  var someDiv = document.getElementById(idToAppend);
  for (let i = 0; i < wordList.length; i++) {
    var li = document.createElement('li');
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.value = wordList[i];
    checkbox.name = chkName;
    if (i < 3) checkbox.checked=true;
    var s = document.createElement('span');
    s.innerText =  wordList[i];

    li.appendChild(checkbox);
    li.appendChild(s);
    someDiv.appendChild(li);
  }
}

function selectAll (chkName) {
  var ele=document.getElementsByName(chkName);  
  for(var i=0; i<ele.length; i++){  
    if(ele[i].type=='checkbox')  
      ele[i].checked=true;  
  }  
}
function deselectAll(chkName) {
  var ele=document.getElementsByName(chkName);  
  for(var i=0; i<ele.length; i++){  
    if(ele[i].type=='checkbox')  
      ele[i].checked=false;  
        
  }  
}

async function getDictResults(checkBoxValues) {
  var dictResults = []
  console.log(checkBoxValues.entries().next())
  for (const word of checkBoxValues) {
    console.log(word)
    var baseURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    var mwResponse = await fetch(baseURL)
    var mwJson = await mwResponse.json()
    if (Array.isArray(mwJson)) mwJson = mwJson[0];  // take only first result. if error this is an object
    dictResults.push(mwJson)
  }
  return dictResults
}

function getErrorWords (words, dictResults) {
  var newDictResults = []
  var errorWords = []
  for (const [index, word] of words.entries()) {
    var thisJson = dictResults[index]
    if (thisJson.hasOwnProperty("word")) {
      newDictResults.push(thisJson)
    } else {
      errorWords.push(word)
    }
  }
  return [newDictResults, errorWords];
}

function placeErrorWordsInDoc (errorWords) {
  var errorP = document.querySelector("#words-not-found");
  errorP.innerHTML = `Words not found by API: ${errorWords.join(", ")}`
}

async function getDefinitions () {
  // clear current definitions
  clearDefinitionCards();

  // get all items that are checked
  var checkedBoxes = document.querySelectorAll('input:checked');
  var checkBoxValues = [];
  checkedBoxes.forEach(x => checkBoxValues.push(x.value));
  console.log("Checked Boxes: " + checkBoxValues);
  // run that through dictionary api
  var dictResults = await getDictResults(checkBoxValues);
  console.log("all dict results")
  console.log(dictResults)

  // identify error words and handle those
  console.log('checking error words');
  var [dictResults, errorWords] = getErrorWords(checkBoxValues, dictResults);
  console.log("error words: " + errorWords);
  placeErrorWordsInDoc(errorWords);

  // generate cards for the words and definitions
  for await (const wordJson of dictResults) {
    console.log(wordJson);
    makeDefinitionCard(wordJson);
  }  

  var defBoxes = document.querySelectorAll(".definition-box");
  defBoxes[0].classList.add('first-def-box');
  defBoxes[defBoxes.length-1].classList.add('last-def-box');
}

function clearDefinitionCards () {
  /**
   * Finds all of the defintion-box divs and removes them from the document
   */
  var defBoxes = document.querySelectorAll('.definition-box');
  defBoxes.forEach((box) => box.remove());
}

function makeDefinitionCard(wordJson) {
  try {
    var word = wordJson['word'];
  }
  catch (exception) {
    // improve handling later
    return;
  }
  let meanings = wordJson['meanings'][0];  // get only first meaning, could be multiple
  let definitions = meanings['definitions'];
  let pos = meanings['partOfSpeech'];
  let synonyms = meanings['synonyms'];
  let antonyms = meanings['antonyms'];

  console.log(word, meanings, definitions, synonyms, antonyms);
  
  var synString = synonyms.join(', ');
  var antString  = antonyms.join(', ');

  // create new div to add
  var defDiv = document.createElement('div');
  defDiv.classList.add('definition-box');
  
  // could have made this more robust but I didn't plan to include more than the first 3 definitions
  var def1 = getDefinitionFromList(definitions, 0)
  var def2 = getDefinitionFromList(definitions, 1)
  var def3 = getDefinitionFromList(definitions, 2)

  // add content to div
  defDiv.innerHTML = `
        <div class="def-header">
          <span class="def-word">${word}</span>
          <span class="def-pos">${pos}</span>
        </div>
        <div class="definitions">
          <span>${def1}</span>
          <span>${def2}</span>
          <span>${def3}</span>
        </div>
        <br>
        <div class="synonyms">
          <span>Synonyms: ${synString}</span>
        </div>
        <br>
        <div class="antonyms">
          <span>Antonyms: ${antString}</span>
        </div>
  `
  
  // append to the scroll window
  var defScroll = document.querySelector("div.def-scroll");
  defScroll.appendChild( defDiv );
}

function getDefinitionFromList (definitionList, index) {
  try {
    return `${index+1}. ${definitionList[index]['definition']}`;
  } catch (exception) {
    return '';
  }
}

async function getData () {
  var result;
  await chrome.storage.local.get(["spWordsData"]).then((response) => {
    console.log("Value currently is: ");
    console.log(response);
    result = response;
  });
  return result;
}

// In chrome extension inline scripting not allowed so need to join listeners here
window.onload = async function () {
  document.getElementById("knownWords-selectAll").addEventListener("click", function() {selectAll("knownWords-chk")});
  document.getElementById("knownWords-deselectAll").addEventListener("click", function () {deselectAll("knownWords-chk")});
  document.getElementById("unknownWords-selectAll").addEventListener("click", function () {selectAll("unknownWords-chk")});
  document.getElementById("unknownWords-deselectAll").addEventListener("click", function () {deselectAll("unknownWords-chk")});
  document.getElementById("getDefinitions-button").addEventListener("click", getDefinitions);

  // this is just defaults for prototyping/testing
  
  var knownWords = [];
  var unknownWords = [];
  try {
    await getData().then((response) => {
      console.log("getData response: ");
      console.log(response);
      knownWords = response.spWordsData.knownWords;
      unknownWords = response.spWordsData.unknownWords;
    });
  }
  catch (exception) {
    //load defaults
    console.log('Exception found: ')
    console.log(exception)
    console.log("Loading default words.")
    knownWords = ['naively', 'alive', 'allay', 'ally', 'anal', 'anneal', 'anvil', 'avail', 'eave', 'inlay', 'lain', 'lane', 'lava', 'lave', 'lean', 'leave', 'leaven', 'nail', 'naive', 'nana', 'nanny', 'naval', 'nave', 'navy', 'vain', 'vainly', 'vale', 'valley', 'vane', 'vanilla', 'veal', 'venal', 'venally', 'vial', 'villa', 'villain', 'villainy'].sort();
    unknownWords = ['venially', 'alien', 'allele', 'alley', 'anally', 'annal', 'avian', 'elan', 'inane', 'inanely', 'lanai', 'leanly', 'lineal', 'lineally', 'naan', 'navel', 'valve', 'vanillin', 'venial', 'villanelle'].sort();
  }
  console.log(knownWords.length + " " + unknownWords.length);
  if (knownWords.length === 0 && unknownWords.length === 0) alert("No known or unkwords found. Check that you are on the NYT spelling bee site with the answers visible.");
  appendList(knownWords, "knownWords-checkboxes", "knownWords-chk");
  appendList(unknownWords, "unknownWords-checkboxes", "unknownWords-chk");
}
