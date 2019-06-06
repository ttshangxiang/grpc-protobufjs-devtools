
## grpc-protobufjs-devtools

适用于利用grpc-web发送的请求，如果利用axios发送和接收请求，有不同的编码规则，需要自行修改devtools.js的相关代码。

#### build
```
npm install
npm run build
```

#### edit
devtools code: ./public  
interface code: ./src  

### use
1, chrome://extensions/, 开发者模式(developer mode)，加载已解压的文件，选择build目录
2, use node and protobufjs create proto.js.
``` javascript
const pbjs = require("protobufjs/cli/pbjs");
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const protoPath = 'src/proto/**/*.proto'; // origin path
const protos = glob.sync(protoPath);

pbjs.main([ "--target", "json-module", "-w", "closure", ...protos], function(err, output) {
  if (err)
    throw err;
  // target path
  fs.writeFileSync(path.resolve(__dirname, './static/xxx/proto.js'), output);
});
``` 
3, mount json url to window.
``` javascript
window.__DEVTOOLS_PROTO_JS__ = '/static/xxx/proto.js'
//or
window.__DEVTOOLS_PROTO_JS__ = 'http://example.com/static/xxx/proto.js'
```
