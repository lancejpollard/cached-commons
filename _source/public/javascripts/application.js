// http://stackoverflow.com/questions/1134976/jquery-sort-list-items-alphabetically
var google_analytics = $('meta[name=google-analytics]').attr('content');
$.trackPage(google_analytics);

$(document).ready(function() {
  $.cachedCommons.setup({
    box: $("textarea.code"),
    code: $("div.code"),
    window: $(window),
    controls: $(".options"),
    content: $(".content")
  });
  $.cachedCommons.trackable();
  $.cachedCommons.scriptable();
  $.cachedCommons.selectable();
  $.cachedCommons.searchable();
  $.cachedCommons.watchWindow();
  $.cachedCommons.home();
  
});
