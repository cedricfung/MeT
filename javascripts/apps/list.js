(function() { define(['zepto'], function($) {

  var FileList = function(sel, cm) {
    this.sel = sel;
    this.usel = sel + ' > ul';
    this.cm = cm;
    this.db = cm.db;
    this.setupView();
    this.populate(this);
  };

  FileList.prototype.populate = function(self) {
    self.db.getPosts(function(posts) {
      var ul = $('<ul></ul>');
      $.each(posts, function(i, p){
        var item = $('<li class="list-item"></li>');
        item.data('key', p.created_at);
        item.html(p.title);
        if (p.created_at === self.cm.currentPost.created_at) {
          item.addClass('current');
        }
        ul.append(item);
      });
      $(self.usel).replaceWith(ul);
      setTimeout(function(){self.populate(self)}, 3000);
    });
  };

  FileList.prototype.setupView = function() {
    var self = this;
    $(document).mousemove(function(evt) {
      if (evt.clientX <= 2) {
        $(self.sel).animate({'margin-left': '0px'}, 300);
      }
    });

    $(self.sel).click(function(evt) {
      evt.stopPropagation();
    });

    $(document).click(function() {
      $(self.sel).animate({'margin-left': '-100%'}, 300);
    });
  };

  return function(sel, cm) {
    return new FileList(sel, cm);
  };

}); }());
