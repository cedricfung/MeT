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
        item.append('<a class="item-close" title="Delete this post">x</a>');
        if (p.created_at === self.cm.currentPost.created_at) {
          item.addClass('current');
        }
        ul.append(item);
      });
      $(self.usel).replaceWith(ul);
    });
  };

  FileList.prototype.show = function(self) {
    $(self.sel).animate({'margin-left': '0px'}, 300);
    self.refresh(self);
  };

  FileList.prototype.hide = function(self) {
    $(self.sel).animate({'margin-left': '-100%'}, 300);
    if (typeof self.timer !== 'undefined') {
      clearTimeout(self.timer);
    }
  };

  FileList.prototype.refresh = function(self) {
    if (typeof self.timer !== 'undefined') {
      clearTimeout(self.timer);
    }
    self.populate(self);
    self.timer = setInterval(function(){self.populate(self)}, 6400);
  };

  FileList.prototype.setupView = function() {
    var self = this;
    $(document).mousemove(function(evt) {
      if (evt.clientX <= 2 && $(self.sel).css('margin-left') !== '0px') {
        self.show(self);
      }
    });

    $(self.sel).click(function(evt) {
      evt.stopPropagation();
    });

    $(document).click(function() {
      self.hide(self);
    });

    $(self.sel + ' .close').click(function(evt) {
      evt.preventDefault();
      self.hide(self);
    });

    $(self.sel + ' .add').click(function(evt) {
      evt.preventDefault();
      self.cm.newPost(function(){
        self.refresh(self);
      });
    });

    $(self.sel).on('click', '.list-item', function(evt) {
      evt.preventDefault();
      self.cm.loadPost($(this).data('key'), function(){
        self.refresh(self);
      });
    });

    $(self.sel).on('click', '.list-item .item-close', function(evt) {
      evt.preventDefault();
      self.cm.deletePost($(this).parent('.list-item').data('key'), function(){
        self.refresh(self);
      });
    });
  };

  return function(sel, cm) {
    return new FileList(sel, cm);
  };

}); }());
