
chrome.devtools.panels.create("grpc",
  "",
  "index.html",
  function (panel) {
    // 控制panel页面
    panel.onShown.addListener(function (extPanelWindow) {
      // 获取网络请求
      chrome.devtools.network.onRequestFinished.addListener(function (ctx) {
        if (ctx.request && ctx.request.postData &&
          ctx.request.postData.mimeType === 'application/grpc-web-text') {
          const url = ctx.request.url;
          extPanelWindow.__addReq(ctx);
          decodeProto(ctx.request.postData.text, url, 'req', function (err, data) {
            ctx.requestBody = data || err;
            extPanelWindow.__updateReq(ctx);
          });
          ctx.getContent(function (body) {
            decodeProto(body, url, 'res', function (err, data) {
              ctx.responseBody = data || err;
              extPanelWindow.__updateReq(ctx);
            });
          })
        }
      })
    });
  }
);

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools"
});

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});

// Relay the tab ID to the background page
backgroundPageConnection.postMessage({
  name: 'inject',
  tabId: chrome.devtools.inspectedWindow.tabId,
  contentScript: "contentScript.js"
});

backgroundPageConnection.onMessage.addListener(function (message) {
  if (message.error) {
    console.error(message.error);
    return;
  }
  if (message.type === 'from-page' && message.method) {
    __callbacks[message.method.callId](message.data);
    delete __callbacks[message.method.callId];
  }
});

// 生成唯一id
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// postMessage的标志
const sourceKey = 'grpc-protobufjs-devtools-extension'
// 存储callback
const __callbacks = {};

/**
 * 调用网页中window上的方法
 * @param {*} name 方法名称
 * @param {*} params 参数
 * @param {*} isSync 调用的方法是否同步
 * @param {*} callback 回调方法
 */
function callFunction(name, params, isSync, callback) {
  const callId = guid();
  if (!Array.isArray(params)) {
    params = [params];
  }
  if (callback) {
    __callbacks[callId] = callback;
  }
  const message = JSON.stringify({
    source: sourceKey,
    type: 'call-function',
    method: {
      callId: callId,
      sync: !!isSync,
      name: name,
      params: params
    }
  })
  chrome.devtools.inspectedWindow.eval(`window.postMessage('${message}')`)
}

window.$root = null;
function getProtoRoot(callback) {
  if (window.$root) {
    callback(null, window.$root);
    return;
  }
  chrome.devtools.inspectedWindow.eval(
    '[window.location.origin, window.__DEVTOOLS_PROTO_JSON__]',
    function (result, isException) {
      if (isException) {
        callback('chrome.devtools.inspectedWindow.eval fail');
      } else {
        if (result && result[1]) {
          let url = result[1];
          if (!/https?\:\/\//.test(url)) {
            if (url[0] !== '/') {
              url = '/' + url;
            }
            url = result[0] + url;
          }
          protobuf.load(url, function (err, root) {
            if (err) {
              callback(err)
              return;
            }
            window.$root = root;
            callback(null, root)
          });
        }
      }
    })
}

function decodeProto (str, url, type, callback) {
  getProtoRoot(function (err, root) {
    if (err) {
      console.log(err)
      callback(err);
      return;
    }
    try {
      const buffer = base64js.toByteArray(str);
      const arr = url.split('/');
      const methodName = arr[arr.length - 1];
      const serviceName = arr[arr.length - 2];
      const service = root.lookup(serviceName);
      const method = service.methods[methodName];
      let messageName = method.requestType;
      if (type === 'res') {
        messageName = method.responseType;
      }
      const message = root.lookupType(messageName);
      try {
        callback(null, message.decode(buffer))
      } catch (error) {
        // grpc-web 发送UInt8Array时前面加了4位0和一个长度
        if (error instanceof RangeError) {
          callback(null, message.decode(buffer.slice(5)))
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.log(error);
      callback(error);
    }
  })
}
