//
//  MathJax (http://www.mathjax.org)
//

(function(){

  var escapeSpecialCharacters = function(text) {
    text = text.replace(/\\\\/g, "\\\\\\");
    return text.replace(/([{}`_\*])/g, "\\$1");
  };

  var inlineMath = function(text) {
    text = text.replace(/\\\((.+?)\\\)/g, function(wholeMatch, m1) {
      return "\\\\(" + escapeSpecialCharacters(m1) + "\\\\)";
    });
    return text;
  };

  var displayMath = function(text) {
    text = text.replace(/\\\[([\S\s]+?)\\\]/g, function(wholeMatch, m1) {
      return "\\\\[" + escapeSpecialCharacters(m1) + "\\\\]";
    });
    return text;
  };

  var mathjax = function(converter) {
    return [
      { type: 'lang', filter: inlineMath },
      { type: 'lang', filter: displayMath }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.mathjax = mathjax; }
  // Server-side export
  if (typeof module !== 'undefined') module.exports = mathjax;

}());
