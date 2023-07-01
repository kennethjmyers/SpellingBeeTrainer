'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  response => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GETTABLE') {
    console.log(`Received request to get table.`);
    var tableData = document.querySelectorAll("ul.sb-modal-wordlist-items > li > span.check, ul.sb-modal-wordlist-items > li > span.sb-anagram");
    console.log(tableData);
    var knownWords = [];
    var unknownWords = [];
    for (let i = 0; i < tableData.length; i+=2) {
      let j = i+1;
      let thisCheck = tableData[i];
      let thisWord = tableData[j].innerHTML;
      if (thisCheck.classList.contains("checked")) {
        knownWords.push(thisWord);
      } else {
        unknownWords.push(thisWord);
      }
    }
    console.log("known words: ");
    console.log(knownWords);
    console.log("unknown words: ");
    console.log(unknownWords);

    if (knownWords.length>0 || unknownWords.length>0) {
      sendResponse({
        type: 'sbWords',
        knownWords: knownWords,
        unknownWords: unknownWords,
        success: true
      });
    } else {
      sendResponse({
        type: 'sbWords',
        knownWords: knownWords,
        unknownWords: unknownWords,
        success: false
      });
    }
    return true;
  }
  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
