jQuery(function ($) { $(document).ready(function(){

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

  var range = function(el) {
    return $.parseJSON(el.attr('data-range'));
  };

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

  var area = $('.editor textarea')[0];
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

  var needFullRender = false;
  var worker = new Worker("worker.js");
  worker.addEventListener('message', function(e) {
    var result = $('<div/>').html(e.data.text).children().length;
    var current = $('> .marked-block', $($(area).data('preview'))).length;
    if (result !== current) {
      needFullRender = true;
    }
  }, false);
  setInterval(function() {
    worker.postMessage({cmd: 'check', text: editor.getValue()})
  }, 8000);

  editor.on('change', function(cm, change) {
    preview = $($(area).data('preview'));
    if (preview.length === 0) {
      return;
    }

    var blocks = $('> .marked-block', preview);
    var from = -1, to = -1, relative = 0, baseBlock = null;

    if (needFullRender || blocks.length === 0) {
      preview.html(marked(cm.getValue()));
      MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]);
      needFullRender = false;
      return;
    }

    var base = range($(blocks[0]))[0];
    if (base > 0) {
      baseBlock = $('<div data-range="[' + [0,base-1] + ']" class="marked-block"></div>');
      baseBlock.hide().insertBefore($(blocks[0]));
      Array.unshift(blocks, baseBlock);
    }

    do {
      var removed = change.removed.join("\n");
      var text = change.text.join("\n");
      var f = cm.indexFromPos(change.from);
      var t = f + removed.length;
      if (from < 0 || from > f) from = f;
      if (to < t) to = t;
      relative += (text.length - removed.length);
    } while (change = change.next);

    var sb = -1, eb = -1;
    for (var i = 0; i < blocks.length; i++) {
      var block = $(blocks[i]);
      if (range(block)[0] <= from && from <= range(block)[1]) {
        sb = i;
      }

      if (range(block)[0] <= to && to <= range(block)[1]) {
        eb = i;
      }

      if (i === blocks.length - 1) {
        if (eb < 0) eb = i;
        if (sb < 0) sb = i;
      }

      if (sb < 0 || eb < 0) {
        continue;
      }

      if (sb - 1 >= 0) sb = sb - 1;
      if (eb + 1 < blocks.length) eb = eb + 1;
      var startBlock = $(blocks[sb]), endBlock = $(blocks[eb]);
      var md = cm.getRange(cm.posFromIndex(range(startBlock)[0]), cm.posFromIndex(range(endBlock)[1] + relative + 1));

      marked(md, {}, function(err, htmlOut) {
        if (err !== null) {
          console.log("Markdown parse error: " + err);
          return;
        }
        for (i = sb + 1; i <= eb; i++) {
          blocks[i].remove();
        }
        startBlock.replaceWith(htmlOut);
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

        if (baseBlock !== null) {
          baseBlock.remove();
        }

        // Simple test begin
        //var blocks_total_len = blocks.length === 0 ? -1 : range(blocks.last())[1];
        //var cm_total_len = blocks_total_len === -1 ? cm.getValue().replace(/^[\s|\n]*$/, '').length : cm.getValue().length;

        //if (!htmlEqual(preview.html(),  marked(cm.getValue())) // TODO this test won't work because MathJax and doBlockSync
            //|| (blocks_total_len != (cm_total_len - 1))) {
              //console.log("error");
              //console.log(preview.html());
              //console.log(marked(cm.getValue()));
              //console.log(htmlEqual(preview.html(),  marked(cm.getValue())));
              //console.log(blocks.length);
              //console.log(blocks_total_len);
              //console.log(cm.getValue().length);
              //console.log(cm_total_len);
              //console.log("error end");
              //alert("Markdown partial parse error!");
            //}
            // Simple test end
      });

      break;
    } // for blocks

  }); // editor.on('change')


  preview.on('mouseenter', '> .marked-block', function(evt) {
    $(this).addClass('block-highlight');
  });
  preview.on('mouseleave', '> .marked-block', function(evt) {
    $(this).removeClass('block-highlight');
  });

}); });
