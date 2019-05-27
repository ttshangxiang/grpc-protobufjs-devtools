
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
          ctx._uid = guid();
          extPanelWindow.__addReq && extPanelWindow.__addReq(ctx);
          const url = ctx.request.url;
          decodeProto(ctx.request.postData.text, url, 'req', function (err, data) {
            if (err) {
              data = err.message + ' body: ' + data;
            }
            ctx.requestBody = data;
            extPanelWindow.__updateReq && extPanelWindow.__updateReq(ctx);
          });
          ctx.getContent(function (body) {
            decodeProto(body, url, 'res', function (err, data) {
              if (err) {
                data = err.message + ' body: ' + data;
              }
              ctx.responseBody = data;
              extPanelWindow.__updateReq && extPanelWindow.__updateReq(ctx);
            });
          })
        }
      })

      // 刷新
      chrome.devtools.network.onNavigated.addListener(function () {
        extPanelWindow.__refresh && extPanelWindow.__refresh();
      });
    });
  }
);

// 生成唯一id
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// protobufjs root
window.$root = null;

/**
 * 获取protobufjs root
 * @param {*} callback 
 */
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
        } else {
          callback(new Error('window.__DEVTOOLS_PROTO_JSON__ is null.'))
        }
      }
    })
}

/**
 * 解压proto
 * @param {*} str base64字符串
 * @param {*} url 访问地址
 * @param {*} type req还是res
 * @param {*} callback 
 */
function decodeProto (str, url, type, callback) {
  getProtoRoot(function (err, root) {
    if (err) {
      console.log(err)
      callback(err, str);
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
      callback(error, str);
    }
  })
}
