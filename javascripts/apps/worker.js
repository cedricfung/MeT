importScripts('../libs/marked.js');

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  blocks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
  langPrefix: 'lang-',
});

addEventListener('message', function(e) {
  switch (e.data.cmd) {
    case 'parse': {
      var result = marked(e.data.text);
      postMessage({type: 'result', text: result});
      setTimeout(function() {
        postMessage({type: 'request'});
      }, 2000);
      break;
    }
    default:
      break;
  }
}, false);
