const selector = "#rso>div";

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "filter") {
            filter(sendResponse)
        } else if (request.action == "filterContent") {
            filterContent(request.indexArray, sendResponse);
        }
});

function filter(sendResponse) {
    let itemList = document.querySelectorAll(selector);
    console.log("use selector '" + selector + "' to get search list", itemList);
    let textList = Array();
    itemList.forEach((node, index, listObj) => {
        textList.push(node.innerText);
    })

    sendResponse(textList)
}

function filterContent(indexArray, sendResponse) {
    let itemList = document.querySelectorAll(selector);
    const indexSet = new Set(indexArray);
    for (let idx = 0; idx < itemList.length; idx++) {
        if (!indexSet.has(idx)) {
            itemList[idx].style = 'display: none;';
        } else {
            itemList[idx].style = 'display: show;';
        }
    }
}
