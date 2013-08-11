(function() { define(['zepto'], function($) {

  return function(ele) {
    var id = $(ele).data('id');
    $(ele).html('<div class="youtube-toggle">YouTube</div><div class="youtube-wrapper"><iframe width="100%" src="//www.youtube.com/embed/' + id + '?html5=1" frameborder="0" allowfullscreen></iframe></div>')
    $('.youtube-toggle', $(ele)).click(function() {
      $('.youtube-wrapper', $(ele)).toggle();
    });
  };

}); }());
