const filterBtn = document.querySelector('#filter-btn')

function log(msg) {
  document.querySelector("#log").innerHTML = msg;
}

filterBtn.addEventListener('click', () => {
  log("已经点击")
  getCurrentTab(filterOnTab)
})

function getCurrentTab(callback) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, ([tab]) => {
    if (chrome.runtime.lastError)
      console.error(chrome.runtime.lastError);
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    callback(tab);
  });
}

function filterOnTab(tab) {
  chrome.tabs.sendMessage(tab.id, {action: "filter"}, function(response) {
    console.log("receive ", response)
    log("receive" + response)

    let textList = response;

    let rows = Array();

    let index_num = 0;
    for (let idx in textList) {
      rows.push({"index_num": index_num, "content": textList[idx]});
      index_num += 1;
    }

    const condition = document.querySelector("#where").value;
    let whereClause;

    if (condition.split(" ").length == 1) {
      whereClause = "content like '%" + condition + "%'"
    } else {
      whereClause = condition;
    }

    const param = {
      "sqlInfo": {
        "sqlTemplate": "select * from db1.logs where " + whereClause},
      "databases": [{
        "name": "db1", "tables": [
          {"tableName": "logs", "columns": [{"name": "index_num", "type": "int32"}, {"name": "content", "type": "string"}],
            "rows": rows}]}]}

    const payload = JSON.stringify(param);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/sql-finder/find")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(payload)

    log("send request")

    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status == 200) {
          log("receive response")
          receiveFindResponse(tab, this.responseText);
        } else {
          log("server status:" + this.status + ", response:" + this.responseText);
        }
      }
    }
  });
}

function receiveFindResponse(tab, responseBody) {
  const payload = JSON.parse(responseBody);
  const rows = payload.result?.rows;
  if (!rows) {
    return;
  }

  const showIndex = rows.map(row => row.index_num);

  log("show index:" + showIndex)

  chrome.tabs.sendMessage(tab.id, {action: "filterContent", indexArray: showIndex}, function(response) {

  });
}
