(function() { define(['zepto', 'marked', 'db', 'list', 'status', 'uploader'], function($, marked, dbEngine, list, status, uploader) {

  var root = window.location.protocol + "//" + window.location.host;

  Date.prototype.format = function(format) {
    var o = {
      "M+" : this.getMonth()+1, //month
      "d+" : this.getDate(),    //day
      "h+" : this.getHours(),   //hour
      "m+" : this.getMinutes(), //minute
      "s+" : this.getSeconds(), //second
      "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
      "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
      (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length==1 ? o[k] :
          ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
  };

  var scrollTop = function() {
    var hTop = $('html').scrollTop();
    return hTop === 0 ? $('body').scrollTop() : hTop;
  };

  var range = function(el) {
    return $.parseJSON(el.attr('data-range'));
  };

  var heading = /^\s*(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/;
  var lheading = /^([^\n]+)\n *(=|-){3,} *\n*/;
  var getTitle = function(md) {
    var cap;
    if (cap = heading.exec(md)) {
      return cap[2];
    }
    if (cap = lheading.exec(md)) {
      return cap[1];
    }
    var title = md.substr(0, 64);
    if ($.trim(title) === '') {
      return new Date().format("yyyy-MM-dd h:mm:ss");
    }
    return title;
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
      return CodeMirror.getMode({}, modes[lang]);
    };
  }());

  var setupWorker = function(met) {
    var worker = new Worker(root +"/javascripts/apps/worker.js");
    worker.addEventListener('message', function(e) {
      switch (e.data.type) {
        case 'result': {
          var result = $('<div/>').html(e.data.text).children().length;
          var current = $(met.mbsa).length;
          if (result !== current) {
            met.needFullRender = true;
          }
          break;
        }
        case 'request': {
          worker.postMessage({cmd: 'parse', text: met.editor.getValue()});
          break;
        }
      }
    }, false);
    worker.postMessage({cmd: 'parse', text: met.editor.getValue()});
  };

  var MeT = function(inputArea, previewArea, inputWrapper, previewWrapper, listArea, statusArea) {
    var self = this;
    this.inputArea = inputArea;
    this.previewArea = previewArea;
    this.inputWrapper = inputWrapper;
    this.previewWrapper = previewWrapper;
    this.listArea = listArea;
    this.statusArea = statusArea;
    this.mbsa = previewArea + ' > .marked-block';
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
      dragDrop: false,
      extraKeys: {
        Tab: function(cm) {
          if (cm.getSelection().length === 0) {
            var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces, "end", "+input");
          } else {
            CodeMirror.commands.indentMore(cm);
          }
        }
      }
    });
    this.needFullRender = false;
    this.editorMarker = null;

    var newTop = function(h1, t1, h2, t2, m) {
      // moving h1 t1 to match h2 t2
      var top = (h2 + t2) - (h1 + t1) + t1;
      return (top >= m ? m : top);
    };

    var topPadding = parseInt($(self.previewWrapper).css('padding-top'));

    var syncTwo = function(sy1, sy2) {
      var sTop = scrollTop();
      sTop = sTop - topPadding > 0 ? sTop - topPadding : sTop;
      var top = newTop(sy1.h, sy1.t, sy2.h, sy2.t, sTop);
      $(sy1.sel).animate({top: top}, 300);
    };

    var lastTrackedRange = [0,0];
    var lastTrackedCursor = -1;

    self.editor.on('cursorActivity', function(cm) {
      var pos = cm.indexFromPos(cm.getCursor());
      if (pos === lastTrackedCursor) {
        return false;
      }
      lastTrackedCursor = pos;
      $(self.mbsa).each(function (i, v) {
        var b = $(v), r = range(b);
        if (r[0] <= pos && pos <= r[1]) {
          if (lastTrackedRange[0] === r[0] && lastTrackedRange[1] === r[1]) {
            return false;
          }
          clearMarker();
          b.addClass('block-current');
          var h1 = b.position().top + b.height() * 0.5;
          var t1 = $(self.previewWrapper).position().top;
          var h2 = (self.editor.charCoords(self.editor.posFromIndex(r[0]), 'local').top + self.editor.charCoords(self.editor.posFromIndex(r[1]), 'local').bottom) * 0.5;
          var t2 = $(self.inputWrapper).position().top;
          syncTwo({h: h1, t: t1, sel: self.previewWrapper}, {h: h2, t: t2, sel: self.inputWrapper});
          lastTrackedRange = r;
          return false;
        }
      });
    });

    self.preview.on('click', 'a', function(evt) {
      window.open($(this).attr('href'), '_blank');
      evt.stopPropagation(); // Zepto doesn't work
    });

    self.preview.on('click', self.mbsa, function(evt) {
      evt.preventDefault();
      var r = range($(this));
      if (lastTrackedRange[0] === r[0] && lastTrackedRange[1] === r[1]) {
        return;
      }
      clearMarker();
      $(this).addClass('block-current');
      var posTop = self.editor.posFromIndex(r[0]);
      var posBottom = self.editor.posFromIndex(r[1]);
      var h1 = (self.editor.charCoords(posTop, 'local').top + self.editor.charCoords(posBottom, 'local').bottom) * 0.5;
      var t1 = $(self.inputWrapper).position().top;
      var h2 = $(this).position().top + $(this).height() * 0.5;
      var t2 = $(self.previewWrapper).position().top;
      syncTwo({h: h1, t: t1, sel: self.inputWrapper}, {h: h2, t: t2, sel: self.previewWrapper});
      lastTrackedRange = r;
      self.editorMarker = self.editor.markText(posTop, posBottom, {className: 'block-current', clearOnEnter: true});
    });

    $(document).on('scroll', function(evt) {
      evt.preventDefault();
      var sTop = scrollTop();
      var posV = $(self.previewWrapper).position().top;
      var posE = $(self.inputWrapper).position().top;
      sTop = sTop - topPadding > 0 ? sTop - topPadding : sTop;
      if ((sTop == 0 && posV < 0) || posV >= sTop) {
        $(self.previewWrapper).animate({top: sTop}, 'fast');
      }
      if ((sTop == 0 && posE < 0) || posE >= sTop) {
        $(self.inputWrapper).animate({top: sTop}, 'fast');
      }
    });

    self.preview.on('mouseenter', self.mbsa, function() {
      $(this).addClass('block-highlight');
    });
    self.preview.on('mouseleave', self.mbsa, function() {
      $(this).removeClass('block-highlight');
    });

    var clearMarker = function() {
      if (self.editorMarker !== null) self.editorMarker.clear();
      $(self.mbsa).removeClass('block-current');
    };

  };

  MeT.prototype.getEditor = function() {
    return this.editor;
  };

  MeT.prototype.loadLastPost = function(self) {
    self.currentPost = {};
    self.db.getPosts(function(posts) {
      var post = posts.slice(-1)[0];
      if (typeof post !== 'undefined') {
        self.currentPost = post;
        self.editor.setValue(self.currentPost.content);
        self.editor.clearHistory();
      } else {
        $.get(root + '/docs/index.md', function(md){
          self.editor.setValue(md);
          self.editor.clearHistory();
        });
      }
    });
  };

  MeT.prototype.newPost = function(callback) {
    this.currentPost = {};
    this.editor.setValue('');
    this.editor.clearHistory();
    callback();
  };

  MeT.prototype.loadPost = function(key, callback) {
    var self = this;
    if (key !== self.currentPost.created_at) {
      self.db.getPost({created_at: key}, function(p) {
        self.currentPost = p;
        self.editor.setValue(self.currentPost.content);
        self.editor.clearHistory();
        callback();
      });
    }
  };

  MeT.prototype.deletePost = function(key, callback) {
    var self = this;
    self.db.deletePost({created_at: key}, function() {
      self.loadLastPost(self);
      callback();
    });
  };

  MeT.prototype.saveChanges = function() {
    var self = this;
    if (self.editor.getValue() !== self.currentPost.content) {
      $.extend(self.currentPost, {
        title:  getTitle(self.editor.getValue()),
        content: self.editor.getValue()
      });
      self.db.putPost(self.currentPost, function(key) {
        self.currentPost.created_at = key;
      });
    }
  };

  MeT.prototype.met = function() {
    var self = this;
    dbEngine.init(function(db) {
      self.db = db;
      self._met();
      list(self.listArea, self);
      status(self.statusArea, self);
      uploader(self.inputWrapper, self);
    });
    return self;
  };

  MeT.prototype._met = function() {
    var self = this;
    var mbsa = self.mbsa;
    var preview = self.preview;
    var editor = self.editor;

    setupWorker(self);
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
      highlight: function(code, lang) {
        var div = $('<div/>');
        CodeMirror.runMode(code, getCMMode(lang), div[0]);
        return '<span class="cm-s-default">' + div.html() + '</span>';
      }
    });

    self.loadLastPost(self);
    editor.on('change', function(cm, change) {
      self.saveChanges();
      preview = $(self.previewArea);
      if (preview.length === 0) {
        return;
      }

      var blocks = $(mbsa);
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
        blocks = $(mbsa);
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

        });

        break;
      } // for blocks

    }); // editor.on('change')
  };

  return function(input, preview, inputWrapper, previewWrapper, listArea, statusArea) {
    return new MeT(input, preview, inputWrapper, previewWrapper, listArea, statusArea).met();
  };

}); }());
