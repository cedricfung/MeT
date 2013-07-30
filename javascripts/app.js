require.config({
  baseUrl: 'javascripts/libs',
  paths: {
    apps: '../apps',
    jquery: 'jquery-2.0.3',
    cm: 'codemirror-3.14',
    marked: 'marked',
  },
});

require([
        "jquery",
        "cm/lib/codemirror",
        "cm/addon/runmode/runmode",
        "cm/addon/mode/overlay",
        "cm/addon/edit/matchbrackets",
        "cm/addon/edit/trailingspace",
        "cm/mode/markdown/markdown",
        "cm/mode/gfm/gfm",
        "cm/mode/stex/stex",
        "cm/mode/diff/diff",
        "cm/mode/gas/gas",
        "cm/mode/clike/clike",
        "cm/mode/commonlisp/commonlisp",
        "cm/mode/scheme/scheme",
        "cm/mode/clojure/clojure",
        "cm/mode/haskell/haskell",
        "cm/mode/ocaml/ocaml",
        "cm/mode/perl/perl",
        "cm/mode/ruby/ruby",
        "cm/mode/python/python",
        "cm/mode/php/php",
        "cm/mode/shell/shell",
        "cm/mode/sql/sql",
        "cm/mode/css/css",
        "cm/mode/xml/xml",
        "cm/mode/javascript/javascript",
        "cm/mode/htmlmixed/htmlmixed",
        "marked"
], function($) {
  require(['apps/ed'], function(ed) {
    var editor = '.editor textarea';
    var preview = '.preview .post';

    var setupHeight = function() {
      $(['.CodeMirror-scroll', editor, preview].join(',')).css({
        'min-height': ($(window).height() - 36) + 'px'
      });
    };

    ed(editor, preview);

    $(setupHeight());
    $(window).on('load resize', function(evt) {
      setupHeight();
    });

  });
});
