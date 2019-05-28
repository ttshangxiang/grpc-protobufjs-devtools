var base64js = require('base64-js');

const buffer = base64js.toByteArray('AAAAADAKATASDOaTjeS9nOaIkOWKnxodCIvaARIS5LiA57qn56ug6IqC5L+h5oGvGAEguwg=gAAAAA9ncnBjLXN0YXR1czowDQo=');
console.log(buffer.toString())

// var encodeRequest_ = function(serialized) {
//   var len = serialized.length;
//   var bytesArray = [0, 0, 0, 0];
//   var payload = new Uint8Array(5 + len);
//   for (var i = 3; i >= 0; i--) {
//     bytesArray[i] = (len % 256);
//     len = len >>> 8;
//   }
//   payload.set(new Uint8Array(bytesArray), 1);
//   payload.set(serialized, 5);
//   return payload;
// };
// console.log(encodeRequest_(buffer).toString())
// const str = base64js.fromByteArray(encodeRequest_(buffer).slice(5))
// console.log(str)