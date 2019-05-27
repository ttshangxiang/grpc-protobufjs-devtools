
var responseText = 'AAAAAloKATASDOaTjeS9nOaIkOWKnxo/Cix0eXBlLmdvb2dsZWFwaXMuY29tL3Jlc291cmNlY2VudGVyLkVkaXRpb25WbxIPGAswAUIJ5LiA5bm057qnGj8KLHR5cGUuZ29vZ2xlYXBpcy5jb20vcmVzb3VyY2VjZW50ZXIuRWRpdGlvblZvEg8YDTABQgnkuInlubTnuqcaPwosdHlwZS5nb29nbGVhcGlzLmNvbS9yZXNvdXJjZWNlbnRlci5FZGl0aW9uVm8SDxgNMAJCCeS4ieW5tOe6pxo/Cix0eXBlLmdvb2dsZWFwaXMuY29tL3Jlc291cmNlY2VudGVyLkVkaXRpb25WbxIPGA4wAUIJ5Zub5bm057qnGj8KLHR5cGUuZ29vZ2xlYXBpcy5jb20vcmVzb3VyY2VjZW50ZXIuRWRpdGlvblZvEg8YDjACQgnlm5vlubTnuqcaPwosdHlwZS5nb29nbGVhcGlzLmNvbS9yZXNvdXJjZWNlbnRlci5FZGl0aW9uVm8SDxgPMAFCCeS6lOW5tOe6pxo/Cix0eXBlLmdvb2dsZWFwaXMuY29tL3Jlc291cmNlY2VudGVyLkVkaXRpb25WbxIPGA8wAkIJ5LqU5bm057qnGj8KLHR5cGUuZ29vZ2xlYXBpcy5jb20vcmVzb3VyY2VjZW50ZXIuRWRpdGlvblZvEg8YEDABQgnlha3lubTnuqcaPwosdHlwZS5nb29nbGVhcGlzLmNvbS9yZXNvdXJjZWNlbnRlci5FZGl0aW9uVm8SDxgQMAJCCeWFreW5tOe6pw==gAAAAA9ncnBjLXN0YXR1czowDQo='
var GrpcWebStreamParser = require('./GrpcWebStreamParser')
var base64js = require('base64-js');
var parser_ = new GrpcWebStreamParser()
var newPos = responseText.length - responseText.length % 4;
var newData = responseText.substr(0, newPos);
var byteSource = base64js.toByteArray(newData);
var messages = parser_.parse([].slice.call(byteSource));
if (messages) {
  var FrameType = GrpcWebStreamParser.FrameType;
  for (var i = 0; i < messages.length; i++) {
    if (FrameType.DATA in messages[i]) {
      var data = messages[i][FrameType.DATA];
      if (data) {
        // var response = self.responseDeserializeFn_(data);
        // if (response) {
        //   self.onDataCallback_(response);
        // }
        // console.log(data)
      }
    }
  }
}
