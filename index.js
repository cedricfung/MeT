jQuery(function ($) { $(document).ready(function(){
  MathJax.Hub.processUpdateTime = 200;
  MathJax.Hub.processUpdateDelay = 15;
  MathJax.Hub.Config({
    skipStartupTypeset: true,
    jax: ["input/TeX", "output/HTML-CSS"],
    tex: { extensions: ['color.js', 'extpfeil.js'] },
    tex2jax: {
      inlineMath: [ ['$', '$'], ['\\(','\\)'] ],
      displayMath: [ ['$$', '$$'], ['\\[','\\]'] ],
    },
  });

  var showdown = new Showdown.converter({extensions: ['mathjax']})

  $('textarea').each(function (index, area) {
    var preview = $($(area).data('preview'));
    var editor = CodeMirror.fromTextArea(area, {
      mode: 'gfm',
      theme: 'default',
      tabSize: 2,
      autoFocus: true,
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets: true,
      showTrailingSpace: true,
    });

    editor.on('change', function(cm, args) {
      if (preview.length !== 0) {
        preview.html(showdown.makeHtml(cm.getValue()));
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]);
      }
    });
  });

}); });
