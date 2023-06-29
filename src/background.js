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
      console.log(response);
    }
  );
  // console.log(response);
  // console.log('hello world');
  chrome.tabs.create({ url: "trainer.html" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});
