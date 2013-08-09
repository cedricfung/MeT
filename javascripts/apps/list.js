(function() { define(['zepto'], function($) {

  var FileList = function(sel, met) {
    this.sel = sel;
    this.osel = sel + '-outer';
    this.usel = sel + ' > ul';
    this.met = met;
    this.db = met.db;
    this.setupView(this);
    this.populate(this);
  };

  FileList.prototype.populate = function(self) {
    self.db.getPosts({order: 'desc'}, function(posts) {
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
    $(self.osel).animate({'margin-left': '0px'}, 128, 'linear', function(){
      self.refresh(self);
    });
  };

  FileList.prototype.hide = function(self) {
    clearTimeout(self.timer);
    $(self.osel).animate({'margin-left': '-' + $(self.sel).width() + 'px'}, 128);
  };

  FileList.prototype.refresh = function(self) {
    clearTimeout(self.timer);
    self.populate(self);
    self.timer = setInterval(function(){self.populate(self);}, 6400);
  };

  FileList.prototype.setupView = function(self) {
    self._setupView(self);
    $(window).resize(function() {
      self._setupView(self);
    });
  };

  FileList.prototype._setupView = function(self) {
    $(self.sel).width($(self.osel).width() + scrollbarWidth());
    $(self.sel).mousedown(function(evt){evt.preventDefault();});

    $(document).mousemove(function(evt) {
      if (evt.clientX <= 4 && $(self.osel).css('margin-left') !== '0px') {
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
        self.hide(self);
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

  var scrollbarWidth = function() {
    var parent, child, width;

    if(width===undefined) {
      parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
      child=parent.children();
      width=child.width()-child.height(99).width();
      parent.remove();
    }

    return width;
  };

  return function(sel, met) {
    return new FileList(sel, met);
  };

}); }());
