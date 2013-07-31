(function() {

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

  var setupWorker = function(met) {
    var worker = new Worker("javascripts/apps/worker.js");
    worker.addEventListener('message', function(e) {
      var result = $('<div/>').html(e.data.text).children().length;
      var current = $(met.mbsa).length;
      if (result !== current) {
        met.needFullRender = true;
      }
    }, false);
    setInterval(function() {
      worker.postMessage({cmd: 'check', text: met.editor.getValue()})
    }, 8000);
  };

  var MeT = function(inputArea, previewArea) {
    var self = this;
    this.inputArea = inputArea;
    this.previewArea = previewArea;
    this.mbs = '> .marked-block';
    this.mbsa = previewArea + ' ' + this.mbs;
    this.area = $(inputArea)[0];
    this.preview = $(previewArea);
    this.editor = CodeMirror.fromTextArea(self.area, {
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
    this.needFullRender = false;
    this.editorMarker = null;

    self.editor.on('cursorActivity', function(cm) {
      var pos = cm.indexFromPos(cm.getCursor());
      clearMarker();
      $(self.mbsa).each(function (i, v) {
        var b = $(v), r = range(b);
        if (r[0] <= pos && pos <= r[1]) {
          b.addClass('block-current');
          return false;
        }
      });
    });


    self.preview.on('mouseenter', self.mbs, function(evt) {
      $(this).addClass('block-highlight');
    });
    self.preview.on('mouseleave', self.mbs, function(evt) {
      $(this).removeClass('block-highlight');
    });

    self.preview.on('dblclick', self.mbs, function(evt) {
      evt.preventDefault();
      var posTop = self.editor.posFromIndex(range($(this))[0]);
      var posBottom = self.editor.posFromIndex(range($(this))[1]);
      var target = self.editor.charCoords(posTop).top;
      $('html, body').animate({scrollTop: target}, 300);
      clearMarker();
      $(this).addClass('block-current');
      self.editorMarker = self.editor.markText(posTop, posBottom, {className: 'block-current', clearOnEnter: true});
    });

    var clearMarker = function() {
      if (self.editorMarker !== null) self.editorMarker.clear();
      $(self.mbsa).removeClass('block-current');
    }
  };

  MeT.prototype.met = function() {
    var self = this;
    var mbs = self.mbs;
    var mbsa = self.mbsa;
    var area = self.area;
    var preview = self.preview;
    var editor = self.editor;

    setupWorker(self);
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

    editor.on('change', function(cm, change) {
      preview = $(self.previewArea);
      if (preview.length === 0) {
        return;
      }

      var blocks = $(mbs, preview);
      var from = -1, to = -1, relative = 0, baseBlock = null;

      if (self.needFullRender || blocks.length === 0) {
        preview.html(marked(cm.getValue()));
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview[0]]);
        self.needFullRender = false;
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

          blocks = $(mbsa);
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
          var blocks_total_len = blocks.length === 0 ? -1 : range(blocks.last())[1];
          var cm_total_len = blocks_total_len === -1 ? cm.getValue().replace(/^[\s|\n]*$/, '').length : cm.getValue().length;

          if (!htmlEqual(preview.html(),  marked(cm.getValue())) // TODO this test won't work because MathJax and doBlockSync
              || (blocks_total_len != (cm_total_len - 1))) {
                alert("Markdown partial parse error!");
              }
              // Simple test end
        });

        break;
      } // for blocks

    }); // editor.on('change')

  };

  define(function() {
    return function(input, preview) {
      new MeT(input, preview).met();
    };
  });

}());
