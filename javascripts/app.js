require.config({
  baseUrl: 'javascripts',
  paths: {
    zepto: 'libs/zepto',
    marked: 'libs/marked',
    cmgfm: 'libs/codemirror/mode/gfm/gfm',
    db: 'apps/db',
    uploader: 'apps/uploader',
    status: 'apps/status',
    list: 'apps/list',
    twitter: 'apps/twitter',
    github: 'apps/github',
    youtube: 'apps/youtube',
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
        "libs/codemirror/mode/properties/properties",
        "libs/codemirror/mode/nginx/nginx",
        "libs/codemirror/mode/http/http",
        "libs/codemirror/mode/markdown/markdown",
        "libs/codemirror/mode/stex/stex",
        "libs/codemirror/mode/diff/diff",
        "libs/codemirror/mode/gas/gas",
        "libs/codemirror/mode/clike/clike",
        "libs/codemirror/mode/pascal/pascal",
        "libs/codemirror/mode/smalltalk/smalltalk",
        "libs/codemirror/mode/cobol/cobol",
        "libs/codemirror/mode/lua/lua",
        "libs/codemirror/mode/tcl/tcl",
        "libs/codemirror/mode/commonlisp/commonlisp",
        "libs/codemirror/mode/scheme/scheme",
        "libs/codemirror/mode/clojure/clojure",
        "libs/codemirror/mode/erlang/erlang",
        "libs/codemirror/mode/haskell/haskell",
        "libs/codemirror/mode/ocaml/ocaml",
        "libs/codemirror/mode/r/r",
        "libs/codemirror/mode/perl/perl",
        "libs/codemirror/mode/ruby/ruby",
        "libs/codemirror/mode/python/python",
        "libs/codemirror/mode/rust/rust",
        "libs/codemirror/mode/go/go",
        "libs/codemirror/mode/d/d",
        "libs/codemirror/mode/php/php",
        "libs/codemirror/mode/groovy/groovy",
        "libs/codemirror/mode/shell/shell",
        "libs/codemirror/mode/vb/vb",
        "libs/codemirror/mode/vbscript/vbscript",
        "libs/codemirror/mode/sql/sql",
        "libs/codemirror/mode/yaml/yaml",
        "libs/codemirror/mode/css/css",
        "libs/codemirror/mode/xml/xml",
        "libs/codemirror/mode/javascript/javascript",
        "libs/codemirror/mode/htmlmixed/htmlmixed"
      ]
    },
    uploader: ['zepto'],
    status: ['zepto'],
    list: ['db', 'zepto'],
    twitter: ['zepto'],
    github: ['zepto'],
    youtube: ['zepto'],
    met: ['youtube', 'github', 'twitter', 'uploader', 'status', 'list', 'db', 'zepto', 'cmgfm', 'marked']
  }
});

require(['zepto', 'met'], function($, met) {

  var list = '#list';
  var status = '#status';
  var editor = '#editor textarea';
  var preview = '#preview .post';
  var editorWrapper = '#editor';
  var previewWrapper = '#preview';

  var setupHeight = function() {
    $(['.CodeMirror-scroll', editor, preview].join(',')).css({
      'min-height': ($(window).height() - 36) + 'px'
    });
    $(list).css('height', $(window).height() + 'px');
  };

  met(editor, preview, editorWrapper, previewWrapper, list, status);

  $(setupHeight());
  $(window).on('load resize', function() {
    setupHeight();
  });

  $('#repoWarning #warning-pass').click(function(e) {
    e.preventDefault();
    $('#repoWarning').animate({opacity: 0}, 640, 'linear', function(){
      $('#repoWarning').remove();
    });
  });

});
