/*
This background script is needed only because it's not possible to use `fetch` in the content page itself
as it will be blocked by CORS.
*/

const url = 'https://www.vocabulary.com/dictionary/';

// Listen for the messages coming from the content script
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        fetch(url + request.word)
            .then((response) => response.text())
            .then((result) => sendResponse({ result }));
        return true;
    }
);
