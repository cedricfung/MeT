jQuery(function ($) { $(document).ready(function(){

  MathJax.Hub.processUpdateTime = 200;
  MathJax.Hub.processUpdateDelay = 15;
  MathJax.Hub.Config({
    skipStartupTypeset: true,
    jax: ["input/TeX", "output/HTML-CSS"],
    tex: { extensions: ['color.js', 'extpfeil.js'] },
    tex2jax: {
      inlineMath: [],
      displayMath: [],
    },
  });

  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: true,
    langPrefix: 'lang-'
  });

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
        preview.html(marked(cm.getValue()));
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]);
      }
    });
  });

}); });
