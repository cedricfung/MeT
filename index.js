jQuery(function ($) { $(document).ready(function(){

  var showdown = new Showdown.converter()

  $('textarea').each(function (index, area) {
    var preview = $($(area).data('preview'));
    var editor = CodeMirror.fromTextArea(area, {
      mode: 'gfm',
      theme: 'default',
      tabSize: 2,
      autoFocus: true,
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      showTrailingSpace: true,
    });

    editor.on('change', function(cm, args) {
      if (preview.length !== 0) {
        preview.html(showdown.makeHtml(cm.getValue()));
      }
    });
  });

}); });
