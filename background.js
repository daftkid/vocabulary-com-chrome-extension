/*
This background script is needed only because it's not possible to use `fetch` in the content page itself
as it will be blocked by CORS.

So it will work in the following order:

    1. Once content page is loaded, extension will inject constent.js script into it.
    2. content script will add listener for the `mouseup` event (that will mean that user has finished selection).
    3. content script will capture all events of selecting text, will parse this selected text, choose the first word in the text
        as vocabulary.com allows to look for single word, and send this word as a message to the extension.
    4. background.js will listen for new messages and once received - it will query the vocabulary.com website to get word's definitions
    5. background.js will then send the whole page HTML back to the content script.
    6. content script will parse output (as only in the content script jquery is allowed, at lease I was not able to get it work in the background.js)
        and draw it in the separate div on top of the page.
*/

const url = 'https://www.vocabulary.com/dictionary/';

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        fetch(url + request.word)
            .then((response) => response.text())
            .then((result) => sendResponse({ result }));
        return true;
    }
);
