
## grpc-protobufjs-devtools


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
2, use node and protobufjs create proto.json.
``` javascript
const pbjs = require("protobufjs/cli/pbjs");
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const protoPath = 'src/proto/**/*.proto'; // origin path
const protos = glob.sync(protoPath);

pbjs.main([ "--target", "json", ...protos], function(err, output) {
  if (err)
    throw err;
  // target path
  fs.writeFileSync(path.resolve(__dirname, './static/xxx/proto.json'), output);
});
``` 
3, mount json url to window.
``` javascript
window.__DEVTOOLS_PROTO_JSON__ = '/static/xxx/proto.json'
//or
window.__DEVTOOLS_PROTO_JSON__ = 'http://example.com/static/xxx/proto.json'
```
