(function() { define(['zepto'], function($) {

  var FileList = function(sel, met) {
    this.sel = sel;
    this.usel = sel + ' > ul';
    this.met = met;
    this.db = met.db;
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
        if (p.created_at === self.met.currentPost.created_at) {
          item.addClass('current');
        }
        ul.append(item);
      });
      $(self.usel).replaceWith(ul);
    });
  };

  FileList.prototype.show = function(self) {
    $(self.sel).animate({'margin-left': '0px'}, 64);
    self.refresh(self);
  };

  FileList.prototype.hide = function(self) {
    $(self.sel).animate({'margin-left': '-' + $(self.sel).width() + 'px'}, 64);
    clearTimeout(self.timer);
  };

  FileList.prototype.refresh = function(self) {
    clearTimeout(self.timer);
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
      self.met.newPost(function(){
        self.refresh(self);
      });
    });

    $(self.sel).on('click', '.list-item', function(evt) {
      evt.preventDefault();
      self.met.loadPost($(this).data('key'), function(){
        self.refresh(self);
      });
    });

    $(self.sel).on('click', '.list-item .item-close', function(evt) {
      evt.preventDefault();
      self.met.deletePost($(this).parent('.list-item').data('key'), function(){
        self.refresh(self);
      });
    });
  };

  return function(sel, met) {
    return new FileList(sel, met);
  };

}); }());
