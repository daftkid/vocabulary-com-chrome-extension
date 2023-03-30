const url = 'https://www.vocabulary.com/dictionary/';
const selDivId = 'vocabulary-extension-sel-box';
const resultDivId = 'vocabulary-extension-result-content';

let selBoxAlreadyCreated = false;

const handleMouseUp = () => {

    const selection = window.getSelection();
    const selectedString = selection.toString();

    if (!selectedString.length || selBoxAlreadyCreated) {
        return;
    }

    const word = selectedString.trim().split(' ')[0];

    // Prepare values for the marker creation
    const markerTextChar = "\ufeff";
    var markerElement, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);
    range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);

    // Create the marker element containing a single invisible character using DOM methods
    markerElement = document.createElement('span');
    markerElement.id = markerId;
    markerElement.appendChild(document.createTextNode(markerTextChar));

    // Insert marker right after the selected word
    range.insertNode(markerElement);

    let selBox;

    if (markerElement) {
        // Lazily create selBox button to be placed next to the selection
        if (!selBox) {
            selBox = document.createElement('button');
            selBox.id = selDivId;
            selBox.onclick = function () { handleSelBoxClick(word) }
            document.body.appendChild(selBox);
        }

        var obj = markerElement;

        var left = 0, top = 0;

        do {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        } while (obj = obj.offsetParent);

        selBox.style.left = left + 10 + 'px';
        selBox.style.top = top - 30 + 'px';

        markerElement.parentNode.removeChild(markerElement);
    }

    // Adding listener that will close SelectionBox if a user clicks outside the SelectionBox element
    document.addEventListener('mousedown', clickOutsideSelBoxCallback);
    selBoxAlreadyCreated = true;
}

const handleSelBoxClick = (word) => {
    chrome.runtime.sendMessage(
        { word },
        (response) => {
            const selBoxElement = $(`#${selDivId}`);

            div = $(response.result).find('div.word-area');

            resultContentBox = $('<div>').attr('id', resultDivId);
            resultContentBox.css('left', selBoxElement.position().left + 'px');
            resultContentBox.css('top', selBoxElement.position().top + 20 + 'px');
            $('body').append(resultContentBox);

            if (div.length) {
                $(div).find('script').remove();
                $(div).find('.word-forms').remove();

                $(`#${resultDivId}`).html(`<div id="${resultDivId}_inner">${div.html()}</div>`);
                short_def = $(div).find('p.short');
                if ($(short_def).is(':empty')) {
                    $(`#${resultDivId}`).html(`<p class="short">No quick definition is available! Please <a href="${url}${word}" target="_blank">check</a> on the site</p>`);
                }
            } else {
                $(`#${resultDivId}`).html('<p class="long">Word not found in vocabulary.com dictionary!</p>');
            }

            // remove a listener for the SelectionBox element to do not spawn errors for non-existent element
            document.removeEventListener('mousedown', clickOutsideSelBoxCallback);
            
            // remove SelectionBox element as it must be not substituted by resultContentBox
            selBoxElement.remove();
            selBoxAlreadyCreated = false;

            // Adding listener that will close resultContentBox if a user clicks outside the resultContentBox element 
            document.addEventListener('click', clickOutsideResultContentBox);
        }
    );
}

const clickOutsideSelBoxCallback = (event) => {
    res = document.getElementById(selDivId);
    if (!res.contains(event.target)) {
        $(`#${selDivId}`).remove();
        selBoxAlreadyCreated = false;
        document.removeEventListener('mousedown', clickOutsideSelBoxCallback);
    };
}

const clickOutsideResultContentBox = (event) => {
    res = document.getElementById(resultDivId);
    if (!res.contains(event.target)) {
        $(`#${resultDivId}`).remove();
        document.removeEventListener('click', clickOutsideResultContentBox);
    };
}

// Main listener that is ijected once the page loads
document.addEventListener('mouseup', handleMouseUp);