require.config({
  baseUrl: '../javascripts',
  paths: {
    jquery: 'libs/jquery-2.0.3',
    marked: 'libs/marked',
    cmgfm: 'libs/codemirror/mode/gfm/gfm',
    met: 'apps/met'
  },
  shim: {
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
      deps: ['jquery', 'cmgfm', 'marked']
    }
  }
});

require(['met', 'marked'], function(met, marked) {

  var docs = [
    'new/autolink_lines',
    'new/double_link',
    'new/gfm_code',
    'new/gfm_tables',
    'new/loose_lists',
    'new/nested_square_link',
    'new/text.smartypants',
    'new/blockquote_list_item',
    'new/escaped_angles',
    'new/gfm_del',
    'new/hr_list_break',
    'new/main',
    'new/not_a_link',
    'new/toplevel_paragraphs',
    'new/case_insensitive_refs',
    'new/gfm_break',
    'new/gfm_em',
    'new/lazy_blockquotes',
    'new/nested_code',
    'new/ref_paren',
    'new/tricky_list',
    'new/def_blocks',
    'new/gfm_code_hr_list',
    'new/gfm_links',
    'new/list_item_text',
    'new/nested_em',
    'new/same_bullet',

    'original/amps_and_angles_encoding',
    'original/hard_wrapped_paragraphs_with_list_like_lines',
    'original/links_reference_style',
    'original/ordered_and_unordered_lists',
    'original/auto_links',
    'original/horizontal_rules',
    'original/links_shortcut_references',
    'original/strong_and_em_together',
    'original/backslash_escapes',
    'original/inline_html_advanced',
    'original/literal_quotes_in_titles',
    'original/tabs',
    'original/blockquotes_with_code_blocks',
    'original/inline_html_comments',
    'original/markdown_documentation_basics',
    'original/tidyness',
    'original/code_blocks',
    'original/inline_html_simple',
    'original/markdown_documentation_syntax',
    'original/code_spans',
    'original/links_inline_style',
    'original/nested_blockquotes',

    'docs/index',
    'docs/help',
    'docs/todo'
  ];

  var editor = '#editor textarea';
  var preview = '#preview .post';
  var editorWrapper = '#editor';
  var previewWrapper = '#preview';

  $(previewWrapper).hide();
  $(editorWrapper).hide();

  var m = met(editor, preview, editorWrapper, previewWrapper);
  var cm = m.getEditor();

  var cases = {'failed': new Array(), 'passed': new Array()};

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

  var markedTest = function(md, html) {
    var md = marked(md);
    var div = $('<div/>').html(md);
    $('.marked-block', div).removeClass('block-current').removeClass('block-highlight');
    $('.marked-block', div).removeAttr('data-range');
    $('.marked-block', div).removeClass('.marked-block');
    return htmlEqual(div.html(), html);
  };

  var metTest = function(md) {
    var compare = function() {
      $('.marked-block', $(preview)).removeClass('block-highlight').removeClass('block-current');
      var indeedBe = $(preview).html();
      var shouldBe = marked(cm.getValue());
      return htmlEqual(shouldBe, indeedBe);
    };

    var testFull = function() {
      cm.setValue(md);
      return compare();
    };

    var testHead = function() {
      cm.replaceRange("\n\n", {line: 0, ch: 0}, {line: 0, ch: 0});
      var r = compare();
      cm.replaceRange("", {line: 0, ch: 0}, {line: 0, ch: 2});
      r = compare() && r;
      cm.replaceRange(md, {line: 0, ch: 0}, {line: 0, ch: 0});
      r = compare() && r;
      return r;
    };

    var testMiddle = function() {
      var middlePos = cm.posFromIndex(cm.getValue().length / 2);
      cm.replaceRange(md, middlePos, middlePos);
      return compare();
    };

    var testTail = function() {
      var lastPos = cm.posFromIndex(cm.getValue().length);
      cm.replaceRange("\na\nb", lastPos, lastPos);
      return compare();
    };

    var pass = testFull();
    pass = testHead() && pass;
    pass = testMiddle() && pass;
    pass = testTail() && pass;

    return pass;
  };

  var testDoc = function testDoc(name) {
    console.log("TEST BEING: " + name);
    var root = window.location.protocol + "//" + window.location.host;
    var mdURL = root + "/tests/fixtures/" + name + ".text";
    var htmlURL = root + "/tests/fixtures/" + name + ".html";

    $.get(mdURL, function(md) {
      $.get(htmlURL, function(html) {
        markedTest(md, html);
        if(metTest(md)) {
          Array.push(cases.passed, name);
        } else {
          console.error("FAILED: " + name);
          Array.push(cases.failed, name);
        }
        console.log("TEST END:   " + name);
        var doc = Array.pop(docs);
        if (typeof doc !== 'undefined') {
          setTimeout(function() {testDoc(doc);}, 1000);
        } else {
          console.log("TEST FINISH!");
        }
      });
    });

  };

  var doc = Array.pop(docs);
  if (typeof doc !== 'undefined') {
    testDoc(doc);
  }

});
