
chrome.devtools.panels.create("grpc",
  "",
  "index.html",
  function (panel) {
    // 控制panel页面
    panel.onShown.addListener(function (extPanelWindow) {
      // 获取网络请求
      // chrome.devtools.network.onRequestFinished.addListener(function (ctx) {
      //   if (ctx.request && ctx.request.postData &&
      //     ctx.request.postData.mimeType === 'application/grpc-web-text') {
      //     const url = ctx.request.url;
      //     decodeReqProto(ctx.request.postData.text, 'req', url, function (data) {
      //       ctx.requestBody = data;
      //       extPanelWindow.__addReq(ctx);
      //     });
      //     ctx.getContent(function (body) {
      //       decodeReqProto(body, 'res', url, function (data) {
      //         ctx.responseBody = data;
      //         extPanelWindow.__updateReq(ctx);
      //       });
      //     })
      //   }
      // })
    });
  }
);


// function decodeReqProto (body, type, url, callback) {
//   getRoot(function ($root) {
//     console.log($root)
//     if (!$root) {
//       callback(body);
//       return;
//     }
//     const arr = url.split('/');
//     const service = $root.__PROTOBUF_ROOT__.lookup(arr[arr.length - 2]);
//     const method = service[arr[arr.length - 1]];
//     if (type === 'req') {
//       body = method.resolvedRequestType.decode(body);
//     }
//     if (type === 'res') {
//       body = method.resolvedResponseType.decode(body);
//     }
//     callback(body);
//     return;
//   })
// }

// // 获取protobuf
// let __PROTOBUF_ROOT__ = null;
// function getRoot (callback) {
//   if (!__PROTOBUF_ROOT__) {
//     chrome.devtools.inspectedWindow.eval(
//       "window.__PROTOBUF_ROOT__",
//       { useContentScriptContext: true },
//       function ($root, isException) {
//         if (isException) {
//           console.log("fail");
//           __PROTOBUF_ROOT__ = $root
//           callback($root);
//         } else {
//           callback(null);
//         }
//       }
//     );
//   } else {
//     callback(__PROTOBUF_ROOT__);
//   }
// }

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
  // Handle responses from the background page, if any
  console.log(message);
});

// // Relay the tab ID to the background page
chrome.runtime.sendMessage(null, {
  tabId: chrome.devtools.inspectedWindow.tabId,
  scriptToInject: "content_script.js"
});
