
chrome.devtools.panels.create("grpc",
  "",
  "index.html",
  function (panel) {
    // 控制panel页面
    panel.onShown.addListener(function (w) {
      extPanelWindow = w;
    });
  }
);

let extPanelWindow = {};

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
          data = 'Error: ' + err.message + ' body: ' + data;
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

// 生成唯一id
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// protobufjs root
window.$root = null;


window.ConversionOptions = {
  enums: String,  // enums as string names
  longs: String,  // longs as strings (requires long.js)
  bytes: String,  // bytes as base64 encoded strings
  defaults: true, // includes default values
  arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
  objects: true,  // populates empty objects (map fields) even if defaults=false
  oneofs: true    // includes virtual oneof fields set to the present field's name
}

/**
 * 获取protobufjs root
 * @param {*} callback 
 */
function getProtoRoot(callback) {
  if (window.$root) {
    callback(null, window.$root);
    return;
  }
  chrome.devtools.inspectedWindow.eval('window.__DEVTOOLS_PROTO_JSON_STRING__',
    function (result, isException) {
      if (isException) {
        callback(new Error('chrome.devtools.inspectedWindow.eval fail'));
      } else {
        if (result) {
          try {
            const json = JSON.parse(result);
            const $root = protobuf.Root.fromJSON(json);
            window.$root = $root;
            callback(null, $root);
          } catch (error) {
            callback(error)
          }
        } else {
          callback(new Error('window.__DEVTOOLS_PROTO_JSON_STRING__ is null.'))
        }
      }
    })
}

/**
 * 解压proto，仅支持grpc-web的规则，如有其它规则请自行修改
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
      str = multiple4(str);
      let buffer = base64js.toByteArray(str);
      // grpc-web 按照规则接收数据，详情请见./GrpcWebStreamParser.js
      if (type === 'res') {
        // grpc-web 需要二次base64转码
        str = multiple4(String.fromCharCode.apply(null, buffer));
        const parser_ = new GrpcWebStreamParser()
        const byteSource = base64js.toByteArray(str);
        const messages = parser_.parse([].slice.call(byteSource));
        buffer = null;
        if (messages) {
          const FrameType = GrpcWebStreamParser.FrameType;
          for (var i = 0; i < messages.length; i++) {
            if (FrameType.DATA in messages[i]) {
              var data = messages[i][FrameType.DATA];
              if (data) {
                buffer = data;
              }
            }
          }
        }
        if (!buffer) {
          callback(new Error('no data'), str);
          return;
        }
      }
      // grpc-web 发送UInt8Array时前面加了4位0和一个长度
      if (type === 'req') {
        buffer = buffer.slice(5);
      }
      const arr = url.split('/');
      const methodName = arr[arr.length - 1];
      const serviceName = arr[arr.length - 2];
      const service = root.lookup(serviceName);
      const method = service.methods[methodName];
      let resolvedMethod = method;
      if (!method.resolved) {
        resolvedMethod = method.resolve();
      }
      let message = resolvedMethod.resolvedRequestType;
      if (type === 'res') {
        message = resolvedMethod.resolvedResponseType;
      }
      let result = message.toObject(message.decode(buffer), window.ConversionOptions);
      // 解析any
      if (message && message._fieldsArray) {
        let hasAny = false;
        message._fieldsArray.forEach(item => {
          if (item.type === "google.protobuf.Any") {
            hasAny = true;
          }
        });
        hasAny && (result = unpackAnyAll(result, root));
      }
      callback(null, result);
    } catch (error) {
      console.log(error);
      callback(error, str);
    }
  })
}

function multiple4 (str) {
  var newPos = str.length - str.length % 4;
  var newData = str.substr(0, newPos);
  return newData;
}
