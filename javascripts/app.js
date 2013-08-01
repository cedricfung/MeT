require.config({
  baseUrl: 'javascripts',
  paths: {
    jquery: 'libs/jquery-2.0.3',
    cm: 'libs/codemirror',
    marked: 'libs/marked',
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
        "marked",
        "apps/met",
], function(f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,
            f11,f12,f13,f14,f15,f16,f17,f18,f19,f20,
            f21,f22,f23,f24,f25,f26,f27,f28,met) {

  var editor = '.editor textarea';
  var preview = '.preview .post';

  var setupHeight = function() {
    $(['.CodeMirror-scroll', editor, preview].join(',')).css({
      'min-height': ($(window).height() - 36) + 'px'
    });
  };

  met(editor, preview);

  $(setupHeight());
  $(window).on('load resize', function(evt) {
    setupHeight();
  });

});
