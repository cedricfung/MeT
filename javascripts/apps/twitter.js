(function() { define(['zepto'], function($) {

  var API = "https://api.twitter.com/1/statuses/oembed.json?omit_script=true&id=";
  var caching = {};

  // https://dev.twitter.com/docs/intents/events
  //return function(ele) {
    //twttr.widgets.createTweet(
      //$(ele).attr('id').split('-')[1],
      //$(ele)[0],
      //function(el){},
      //{ align: 'center' }
    //);
  //};

  // https://dev.twitter.com/docs/api/1.1/get/statuses/oembed
  return function(ele) {
    var id = $(ele).attr('data-id');
    if (caching[id]) {
      $(ele).html(caching[id]);
    } else {
      $.ajax({
        url: API + id,
        dataType: "jsonp",
        async: false,
        withCredentials: true,
        success: function(res) {
          caching[id] = res.html;
          $(ele).html(caching[id]);
        }
      });
    }
  };

}); }());
