(function() { define(['zepto'], function($) {

  var Status = function(sel, met) {
    this.sel = sel;
    this.met = met;
    this.title = this.sel + ' .title';
    this.position = this.sel + ' .position';
    this.total = this.sel + ' .total';
    this.setupView(this);
    this.refresh(this);
  };

  Status.prototype.refresh = function(self) {
    clearTimeout(self.timer);

    $(self.title).html(self.met.currentPost.title);
    var editor = self.met.getEditor();
    var pos = editor.getCursor();
    $(self.position + ' .line').html(pos.line);
    $(self.position + ' .char').html(pos.ch);
    $(self.total + ' .line').html(editor.lineCount());
    $(self.total + ' .char').html(editor.getValue().length);

    self.timer = setInterval(function(){self.refresh(self);}, 1000);
  };

  Status.prototype.show = function(self) {
    $(self.sel).animate({'margin-bottom': '0px'}, 64);
    self.refresh(self);
  };

  Status.prototype.hide = function(self) {
    $(self.sel).animate({'margin-bottom': '-' + $(self.sel).height() + 'px'}, 64);
    clearTimeout(self.timer);
  };

  Status.prototype.setupView = function(self) {
    $(document).mousemove(function(evt) {
      if (evt.clientY + 2 >= $(window).height()  && $(self.sel).css('margin-bottom') !== '0px') {
        self.show(self);
      }
    });

    $(self.sel).click(function() {
      self.hide(self);
    });
  };

  return function(sel, met) {
    return new Status(sel, met);
  };

}); }());
