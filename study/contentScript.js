// Isolated worlds do not allow for content scripts, the extension, and the web page to access any variables or functions created by the others.
// 隔离世界不允许内容脚本，扩展和网页访问其他人创建的任何变量或功能。

(function () {
  const sourceKey = 'grpc-protobufjs-devtools-extension'
  const scriptId = '__DEV_PROTOBUFJS_SCRIPT__'

  // sendMessage
  window.addEventListener('message', function(event) {
    // Only accept messages from the same frame
    if (event.source !== window) {
      return;
    }
    var message = JSON.parse(event.data);
  
    // Only accept messages that we know are ours
    if (typeof message !== 'object' || message === null ||
        !message.source === sourceKey) {
      return;
    }
  
    if (message.type === 'from-page') {
      chrome.runtime.sendMessage(message);
    }
  });

  // inject js
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.id = scriptId
    script.innerHTML = `
      window.addEventListener('message', function (event) {
        // Only accept messages from the same frame
        if (event.source !== window) {
          return;
        }
        const message = JSON.parse(event.data);
      
        // Only accept messages that we know are ours
        if (typeof message !== 'object' || message === null ||
            !message.source === '${sourceKey}') {
          return;
        }

        try {
          // call function
          const method = message.method;
          if (message.type === 'call-function' && method &&
              typeof message === 'object') {
            const callback = function (data) {
              const obj = {
                source: message.source,
                type: 'from-page',
                data: data,
                method: method
              };
              window.postMessage(JSON.stringify(obj))
            };
            let func = window;
            method.name.split('.').forEach(item => {
              item && (func = func[item]);
            });
            if (method.sync) {
              callback(func.apply(null, method.params))
            } else {
              func.apply(null, method.params.concat(callback))
            }
          }
        } catch (err) {
          const obj = {
            source: message.source,
            type: 'from-page',
            method: method,
            error: err.toString()
          };
          window.postMessage(JSON.stringify(obj))
        }
      });
    `
    document.body.appendChild(script)
  }
})()
