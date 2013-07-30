importScripts('libs/marked.js');

addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'check': {
      var result = marked(data.text);
      postMessage({text: result});
      break;
    }
    default:
      break;
  }
}, false);
