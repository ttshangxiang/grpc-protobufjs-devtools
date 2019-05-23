chrome.devtools.panels.create("grpc",
    "",
    "Panel.html",
    function(panel) {
      // 控制panel页面
      panel.onShown.addListener(function (extPanelWindow) {
          extPanelWindow instanceof Window; // true
          extPanelWindow.document.body.innerHTML = 'XIXIXIX'
      });
    }
);

// 获取网络请求
chrome.devtools.network.onRequestFinished.addListener(function (request) {
  if (request.response.content.mimeType === 'application/json') {
    request.getContent(function (body) {
      console.log(body);
      console.log(window)
    })
  }
})

// 注入js
chrome.devtools.inspectedWindow.eval(
  "document.title",
   function(result, isException) {
     if (isException)
       console.log("fail");
     else
       console.log(result);
   }
);
