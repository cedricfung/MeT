(function() { define(['zepto'], function($) {

  var IO_URL = "https://i.repo.io";
  var IO_KEY = "i.repo.io";
  var IO_SEC = "f8f21d8fba3698d5c5c65c6538913adbfe9ab060";

  var Uploader = function(wrapper, met) {
    this.wrapper = '.CodeMirror pre';
    this.met = met;
    this.init(this);
    this.ulw = {};
  };

  Uploader.prototype.init = function(self) {
    var cm = self.met.editor;

    $('.CodeMirror-code').on('dragover', 'pre', function(e){
      self.setupDnDArea(self, cm, e);
      e.preventDefault();
    });

    $('.CodeMirror-code').on('dragenter', 'pre', function(e){
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
        }
      }
      e.preventDefault();
    });
  };

  Uploader.prototype.setupDnDArea = function(self, cm, e) {
    var line = e.target.lineObj;// || e.originalTarget.lineObj;
    if (typeof line !== 'undefined') {
      var dnd = $('<progress id="dnd-line-widget" class="dnd-progress progress" max="100" value="0"></progress>');
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
    xhr.setRequestHeader('Content-Description', file.name);
    xhr.setRequestHeader('Content-Length', file.size);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Expect', '100-continue');
    xhr.onreadystatechange = function(evt) {
      console.log(evt);
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          self.ulw.lineWidget.clear();
          var cm = self.met.editor;
          var res = $.parseJSON(evt.target.responseText);
          var l = cm.getLineNumber(self.ulw.line) + 1;
          cm.replaceRange("![" + res.name + "](" + res.url + ")\n", {line:l, ch:0}, {line:l, ch:0});
        } else {
          console.log("XHR Error: " + xhr.status);
        }
      } else {
        console.log("readyState: " + xhr.readyState);
      }
    };
    xhr.upload.addEventListener("progress", function(e) {
      if ($('#dnd-line-widget').length !== 0) {
        $('#dnd-line-widget')[0].value = e.loaded;
        $('#dnd-line-widget')[0].max = e.total;
      }
    }, false);
    var reader = new FileReader();
    reader.onload = function(evt) {
      xhr.send(evt.target.result);
    };
    reader.readAsArrayBuffer(file);
    // xhr.send(file);
  };

  return function(wrapper, met) {
    return new Uploader(wrapper, met);
  };

}); }());
