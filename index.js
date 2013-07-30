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
        Tab: function(cm) {
          if (cm.getSelection().length === 0) {
            var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces, "end", "+input");
          } else {
            CodeMirror.commands.indentMore(cm);
          }
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
      if (a.length != b.length) {
        return false;
      }

      for (var i = 0; i < a.length; i++) {
        if (a[i].outerHTML !== b[i].outerHTML) {
          return false;
        }
      }
      return true;
    };

    editor.on('change', function(cm, args) {
      var preview = $($(area).data('preview'));
      if (preview.length !== 0) {
        var _bb = null;
        var from = -1, to = -1, relative = 0;
        var blocks = $('> .marked-block', preview);
        if (blocks.length === 0) {
          preview.html(marked(cm.getValue()));
          MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]);
        } else {
          var base = range($(blocks[0]))[0];
          if (base > 0) {
            _bb = $('<div data-range="[' + [0,base-1] + ']" class="marked-block"></div>');
            _bb.hide().insertBefore($(blocks[0]));
            blocks = $('> .marked-block', preview);
          }
          console.log(args);
          do {
            var removed = args.removed.join("\n");
            var text = args.text.join("\n");
            var f = cm.indexFromPos(args.from);
            var t1 = f + removed.length;
            //var t2 = f + text.length - removed.length;
            console.log({t: text.length, r: removed.length, f: f, t1: t1});
            if (from < 0 || from > f) from = f;
            if (to < t1) {
              to = t1;
              relative += (text.length - removed.length);
            }
            //if (to < t2) to = t2;
          } while (args = args.next);

          console.log({from: from, to: to, relative: relative, base: base});

          var start_block = -1, end_block = -1;
          $.each(blocks, function (i, v) {
            var block = $(v);
            if (range(block)[0] <= from && from <= range(block)[1]) {
              start_block = i;
            }

            if (range(block)[0] <= to && to <= range(block)[1]) {
              end_block = i;
            }

            if (i === blocks.length - 1) {
              if (end_block < 0) end_block = i;
              if (start_block < 0) start_block = i;
            }



            if (start_block >= 0 && end_block >= 0) {
              if (start_block - 1 >= 0) start_block = start_block - 1;
              if (end_block + 1 < blocks.length) end_block = end_block + 1;
              var sb = $(blocks[start_block]), eb = $(blocks[end_block]);
              var str = cm.getRange(cm.posFromIndex(range(sb)[0]), cm.posFromIndex(range(eb)[1] + relative + 1));

              marked(str, {}, function(err, htmlOut) {
                if (err !== null) {
                  console.log("Markdown parse error: " + err);
                  return;
                }
                for (i = start_block + 1; i <= end_block; i++) {
                  blocks[i].remove();
                }
                sb.replaceWith(htmlOut);
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]); // TODO should make the changed maths reproduce only?

                blocks = $('> .marked-block', preview);
                if (blocks.length !== 0) {
                  $.each(blocks, function (i, v) {
                    var block = $(v);
                    if (i > 0) {
                      var prev = $(blocks[i-1]);
                      if (range(block)[0] !== range(prev)[1] + 1) {
                        var begin = range(prev)[1] + 1;
                        var end = begin - range(block)[0] + range(block)[1];
                        block.attr('data-range', '[' + [begin, end] + ']');
                      }
                    }
                  });
                }
                if (_bb !== null) {
                  _bb.remove();
                }
                if (!htmlEqual(preview.html(),  marked(cm.getValue())) // TODO this test won't work because MathJax
                    || (range(blocks.last())[1] != (cm.getValue().length - 1))) {
                      console.log("error");
                      console.log(preview.html());
                      console.log(marked(cm.getValue()));
                      console.log(cm.getValue().length);
                      console.log("error end");
                      alert("Markdown partial parse error!");
                    }

                    // how about to  check the marked(cm.getValue) with $('> .marked-block') length every 5 seconds (check only when some modification occured, such as ```, which may change instructures, result in different blocks count, only in different blocks count, the above solutions can't detect, maybe I could find a better solution to address this issue!
                    // Maybe I could benefit from new JS worker feature

              });

              return false;
            }
          });

        }
      }
    });
  });

}); });
