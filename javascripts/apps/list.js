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
        item.html('<a class="item-title">' + p.title + '</a>');
        item.append('<a class="item-close">x</a>');
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

    $(self.sel + ' .close').click(function(evt) {
      evt.preventDefault();
      $(self.sel).animate({'margin-left': '-100%'}, 300);
    });

    $(self.sel + ' .add').click(function(evt) {
      evt.preventDefault();
      self.cm.newPost();
    });

    $(self.sel).on('click', '.list-item .item-title', function(evt) {
      evt.preventDefault();
      self.cm.loadPost($(this).parent('.list-item').data('key'));
    });

    $(self.sel).on('click', '.list-item .item-close', function(evt) {
      evt.preventDefault();
      self.cm.deletePost($(this).parent('.list-item').data('key'));
    });

    $(self.sel).on('mouseenter', '.list-item', function(evt) {
      evt.preventDefault();
      $('.item-close', $(this)).animate({opacity: '0.5'}, 300);
    });
    $(self.sel).on('mouseleave', '.list-item', function(evt) {
      evt.preventDefault();
      $('.item-close', $(this)).animate({opacity: '0'}, 300);
    });
  };

  return function(sel, cm) {
    return new FileList(sel, cm);
  };

}); }());
