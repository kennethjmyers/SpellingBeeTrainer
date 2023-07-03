'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.action.onClicked.addListener((tab) => {
  //const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  console.log(tab);
  console.log(tab.id);
  //const response = chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
  chrome.tabs.sendMessage(
    tab.id,
    {
      type: 'GETTABLE',
    },
    response => {
      console.log('here for response');
      console.log(response);
      if (response.success === true) {
        chrome.storage.local.set({ spWordsData: response }).then(() => {
          console.log("Value is set");
        });
      } 
    }
  );
  chrome.tabs.create({ url: "trainer.html" });
});
