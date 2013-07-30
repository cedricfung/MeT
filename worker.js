importScripts('libs/marked.js');

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
  langPrefix: 'lang-',
});

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
