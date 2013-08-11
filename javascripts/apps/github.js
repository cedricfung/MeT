(function() { define(['zepto'], function($) {

  var gistCaching = {};

  var renderGist = function(ele, gist) {
    var css = "https://gist.github.com" + gist.stylesheet;
    if($('link[href="' + css + '"]').length === 0){
      $('head').prepend('<link rel="stylesheet" type="text/css" media="screen" href="' + css + '" />');
    }
    $(ele).html(gist.div);
    $('.gist-meta', $(ele)).click(function() {
      $('.gist-data', $(ele)).toggle();
    });
  };

  // http://stackoverflow.com/questions/9154026/jquery-dynamically-load-a-gist-embed
  return function(ele) {
    var id = $(ele).data('id');
    if (gistCaching[id]) {
      renderGist(ele, gistCaching[id]);
    } else {
      window["gist_callback_count"] = (window["gist_callback_count"] || 0) + 1;
      var callbackName = "gist_callback_" + window["gist_callback_count"];
      window[callbackName] = function (gist) {
        renderGist(ele, gist);
        gistCaching[id] = gist;
        script.parentNode.removeChild(script);
        delete window[callbackName];
      };
      var script = document.createElement("script");
      script.setAttribute("src", "https://gist.github.com/" + id + ".json?callback=" + callbackName);
      document.body.appendChild(script);
    }
  };

}); }());
