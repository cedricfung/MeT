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

  return function(ele) {
    var id = $(ele).data('id');
    if (gistCaching[id]) {
      renderGist(ele, gistCaching[id]);
    } else {
      $.ajax({
        url: "https://gist.github.com/" + id + ".json",
        dataType: "jsonp",
        async: false,
        withCredentials: true,
        success: function(gist) {
          gistCaching[id] = gist;
          renderGist(ele, gist);
        }
      });
    }
  };

}); }());
