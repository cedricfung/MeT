jQuery(function ($) { $(document).ready(function(){

  var getCMMode = (function () {
    var aliases = {
      html: "htmlmixed",
      js: "javascript",
      json: "application/json",
      c: "text/x-csrc",
      "c++": "text/x-c++src",
      java: "text/x-java",
      csharp: "text/x-csharp",
      "c#": "text/x-csharp",
      scala: "text/x-scala"
    };

    var i, modes = {}, mimes = {}, mime;

    var list = [];
    for (var m in CodeMirror.modes)
      if (CodeMirror.modes.propertyIsEnumerable(m)) list.push(m);
    for (i = 0; i < list.length; i++) {
      modes[list[i]] = list[i];
    }
    var mimesList = [];
    for (var m in CodeMirror.mimeModes)
      if (CodeMirror.mimeModes.propertyIsEnumerable(m))
        mimesList.push({mime: m, mode: CodeMirror.mimeModes[m]});
    for (i = 0; i < mimesList.length; i++) {
      mime = mimesList[i].mime;
      mimes[mime] = mimesList[i].mime;
    }

    for (var a in aliases) {
      if (aliases[a] in modes || aliases[a] in mimes)
        modes[a] = aliases[a];
    }

    return function (lang) {
      return modes[lang] ? CodeMirror.getMode({}, modes[lang]) : 'clike';
    };
  }());

  MathJax.Hub.processUpdateTime = 200;
  MathJax.Hub.processUpdateDelay = 15;
  MathJax.Hub.Config({
    skipStartupTypeset: true,
    messageStyle: "none",
    jax: ["input/TeX", "output/HTML-CSS"],
    tex: { extensions: ['color.js', 'extpfeil.js'] },
    tex2jax: {
      inlineMath: [],
      displayMath: [],
    },
  });

  $(window).on('load resize', function(evt) {
    $('.CodeMirror-scroll, .editor textarea, .preview .post').css({
      'min-height': ($(window).height() - 36) + 'px'
    });
  });

  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: true,
    langPrefix: 'lang-',
    highlight: function(code, lang) {
      var div = $('<div/>');
      CodeMirror.runMode(code, getCMMode(lang), div[0]);
      return '<span class="cm-s-default">' + div.html() + '</span>';
    }
  });

  $('textarea').each(function (index, area) {
    var preview = $($(area).data('preview'));
    var editor = CodeMirror.fromTextArea(area, {
      mode: 'gfm',
      theme: 'default',
      tabSize: 2,
      autofocus: true,
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets: true,
      showTrailingSpace: true,
      extraKeys: {
        "Tab": function (cm) {
          cm.replaceSelection("  ", "end");
        },
      }
    });

    var range = function(el) {
      return $.parseJSON(el.attr('data-range'));
    };

    var htmlEqual = function(a, b) {
      var div = $('<div/>');
      a = div.html(a).children();
      b = div.html(b).children();
      for (var i = 0; i < a.length; i++) {
        if (a[i].outerHTML !== b[i].outerHTML) {
          return false;
        }
      }
      return true;
    };

    editor.on('change', function(cm, args) {
      if (preview.length !== 0) {
        var removed = args.removed.join("\n");
        var text = args.text.join("\n");
        var from = cm.indexFromPos(args.from);
        var to = cm.indexFromPos(args.to);
        var blocks = $('> .marked-block', preview);
        if (blocks.length === 0) {
          preview.html(marked(cm.getValue()));
          MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]);
        } else {
          console.log(args);
          $.each(blocks, function (i, v) {
            var block = $(v);
            var block_n = $(blocks[i+1]);
            var bb = range(block)[0];
            var be = range(block)[1];
            var ben = (block_n.length === 0) ? be + text.length : range(block_n)[1] + text.length;
            var ce = from + args.text[0].length;
            if (from >= bb && from <= be+1) {
              var str = cm.getRange(cm.posFromIndex(bb), cm.posFromIndex(ben+1));
              return marked(str, {}, function(err, htmlOut) {
                if (err !== null) {
                  console.log("Markdown parse error: " + err);
                  return;
                }

                block.replaceWith(htmlOut);
                if (block_n.length !== 0) {
                  block_n.remove();
                }
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]); // TODO should make the changed maths reproduce only?

                blocks = $('> .marked-block', preview);
                if (blocks.length !== 0) {
                  $.each(blocks, function (i, v) {
                    var base = 0;
                    var block = $(v);
                    if (i > 0) {
                      var prev = $(blocks[i-1]);
                      if (range(block)[0] <= range(prev)[1]) {
                        var begin = range(prev)[1] + 1;
                        var end = begin - range(block)[0] + range(block)[1];
                        block.attr('data-range', '[' + [begin, end] + ']');
                      }
                    }
                  });
                }
                console.log(htmlEqual(preview.html(),  marked(cm.getValue()))); // TODO this test won't work because MathJax
                console.log(range(blocks.last())[1] == (cm.getValue().length - 1));
              });
            }
          });
        }
      }
    });
  });

}); });
