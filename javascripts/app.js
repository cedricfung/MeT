require.config({
  baseUrl: 'javascripts',
  paths: {
    zepto: 'libs/zepto',
    marked: 'libs/marked',
    cmgfm: 'libs/codemirror/mode/gfm/gfm',
    met: 'apps/met'
  },
  shim: {
    zepto: { exports: "$" },
    cmgfm: {
      exports: "CodeMirror",
      deps: [
        'libs/codemirror/lib/codemirror',
        "libs/codemirror/addon/runmode/runmode",
        "libs/codemirror/addon/mode/overlay",
        "libs/codemirror/addon/edit/matchbrackets",
        "libs/codemirror/addon/edit/trailingspace",
        "libs/codemirror/mode/markdown/markdown",
        "libs/codemirror/mode/stex/stex",
        "libs/codemirror/mode/diff/diff",
        "libs/codemirror/mode/gas/gas",
        "libs/codemirror/mode/clike/clike",
        "libs/codemirror/mode/commonlisp/commonlisp",
        "libs/codemirror/mode/scheme/scheme",
        "libs/codemirror/mode/clojure/clojure",
        "libs/codemirror/mode/haskell/haskell",
        "libs/codemirror/mode/ocaml/ocaml",
        "libs/codemirror/mode/perl/perl",
        "libs/codemirror/mode/ruby/ruby",
        "libs/codemirror/mode/python/python",
        "libs/codemirror/mode/php/php",
        "libs/codemirror/mode/shell/shell",
        "libs/codemirror/mode/sql/sql",
        "libs/codemirror/mode/css/css",
        "libs/codemirror/mode/xml/xml",
        "libs/codemirror/mode/javascript/javascript",
        "libs/codemirror/mode/htmlmixed/htmlmixed"
      ]
    },
    met: {
      deps: ['zepto', 'cmgfm', 'marked']
    }
  }
});

require(['zepto', 'met'], function(zepto, met) {

  var editor = '#editor textarea';
  var preview = '#preview .post';
  var editorWrapper = '#editor';
  var previewWrapper = '#preview';

  var setupHeight = function() {
    $(['.CodeMirror-scroll', editor, preview].join(',')).css({
      'min-height': ($(window).height() - 36) + 'px'
    });
  };

  met(editor, preview, editorWrapper, previewWrapper);

  $(setupHeight());
  $(window).on('load resize', function() {
    setupHeight();
  });

});
