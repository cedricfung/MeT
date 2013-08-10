(function() { define(['zepto'], function($) {

  var API = "https://api.twitter.com/1/statuses/oembed.json?omit_script=false&maxwidth=550&align=center&id=";

  return function(ele) {
    var id = $(ele).attr('id').split('-')[1];
    $.ajax({
      url: API + id,
      dataType: "jsonp",
      async: false,
      success: function(res) {
        $(ele).html(res.html);
        if (typeof twttr !== 'undefined') {
          twttr.widgets.load();
        }
      }
    });
  };

}); }());
