(async function() {
    const getCurrentTab = async () => {
        let queryOptions = {
            active: true,
            lastFocusedWindow: true
        };
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab.id;
    }

    const getSelection = () => window.getSelection().toString();

    const tabId = await getCurrentTab();

    chrome.scripting.executeScript({
            target: {
                tabId
            },
            func: getSelection,
        },
        async (selection) => {
            console.log("----> selection: ", selection);
            const selected_words = selection[0].result;
            const word = selected_words.trim().split(' ')[0];
            var url = `https://www.vocabulary.com/dictionary/${word}`
            let promise = await fetch(url);

            if (promise.ok) {
                let res_html = await promise.text();

                div = $(res_html).find("div.word-area");
                if (div.length) {
                    $("#result").html(div.html());
                    short_def = $(div).find('p.short');
                    if ($(short_def).is(':empty')) {
                        $('#result').html(`<p class="short">No quick definition is available! Please <a href="${url}" target="_blank">check</a> on the site</p>`);
                    }
                } else {
                    $("#result").html('<p class="word-forms">Word not found in vocabulary.com dictionary!</p>');
                }

            } else {
                console.log("HTTP error" + promise.status);
                $("#result").text(promise.status);
            }
        }
    );

})();
