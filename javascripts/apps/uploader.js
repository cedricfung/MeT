(function() { define(['zepto'], function($) {

  var IO_URL = "https://i.repo.io";
  var IO_KEY = "i.repo.io";
  var IO_SEC = "f8f21d8fba3698d5c5c65c6538913adbfe9ab060";

  var Uploader = function(met) {
    this.met = met;
    this.des = {};
    this.ulw = {};
    this.init(this);
  };

  Uploader.prototype.init = function(self) {
    var cm = self.met.editor;

    window.addEventListener("dragover",function(e){
      e.preventDefault();
    },false);
    window.addEventListener("drop",function(e){
      e.preventDefault();
    },false);

    $('.CodeMirror-code').on('dragover', 'pre', function(e){
      self.setupDnDArea(self, cm, e);
      e.preventDefault();
    });

    $('.CodeMirror-code').on('dragleave', 'pre', function(e){
      if (typeof self.ulw.lineWidget !== 'undefined') {
        self.ulw.lineWidget.clear();
      }
      e.preventDefault();
    });

    $('.CodeMirror-code').on('drop', 'pre', function(e){
      var files = e.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log(file);
        if (self.check(file)) {
          self.upload(self, file);
        } else {
          self.ulw.lineWidget.clear();
        }
      }
      e.preventDefault();
    });
  };

  Uploader.prototype.setupDnDArea = function(self, cm, e) {
    var line = e.target.lineObj;
    if (typeof line !== 'undefined') {
      var dnd = $('<div id="dnd-line-widget" class="progress-max"><div class="progress-name"></div><div class="progress-value"></div></progress>');
      var sel = '#dnd-line-widget';
      if ($(sel).length === 0) {
        self.ulw.lineWidget = cm.addLineWidget(line, dnd[0]);
      } else {
        self.ulw.lineWidget.clear();
        self.ulw.lineWidget = cm.addLineWidget(line, dnd[0]);
      }
      self.ulw.line = line;
    }
  };

  Uploader.prototype.check = function(file) {
    return (file.type.indexOf("image/") === 0);
  };

  Uploader.prototype.upload = function(self, file) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', IO_URL, true);
    xhr.setRequestHeader('X-API-KEY', IO_KEY);
    xhr.setRequestHeader('X-API-SECRET', IO_SEC);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Content-Length', file.size);
    xhr.setRequestHeader('Content-Description', btoa(unescape(encodeURIComponent(file.name))));
    xhr.setRequestHeader('Expect', '100-continue');
    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState == 4) {
        if (xhr.status == 201) {
          self.ulw.lineWidget.clear();
          var cm = self.met.editor;
          var res = $.parseJSON(evt.target.responseText);
          var l = cm.getLineNumber(self.ulw.line) + 1;
          cm.replaceRange("![" + res.name + "](" + res.url + ")\n", {line:l, ch:0}, {line:l, ch:0});
        } else {
          console.log("XHR Error: " + xhr.status);
        }
      }
    };
    xhr.upload.addEventListener("progress", function(e) {
      $('.progress-value').animate({width: (100 * e.loaded / e.total) + '%'}, 100);
    }, false);
    $('.progress-name').html(file.name);
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = e.target.result;
      var length = data.length;
      var ui8Data = new Uint8Array(length);
      for (var i = 0; i < length; i++) {
        ui8Data[i] = data.charCodeAt(i) & 0xff;
      }
      xhr.send(ui8Data);
    };
    reader.readAsBinaryString(file);
    // xhr.send(file);
  };

  return function(met) {
    return new Uploader(met);
  };

}); }());
