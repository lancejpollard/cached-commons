// http://stackoverflow.com/questions/1134976/jquery-sort-list-items-alphabetically
var hash = window.location.hash;
window.location.hash = null;
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
  
  var start_at = $(".bottom").offset().top;
  $(".bottom").css("position", "absolute").width("100%");
  function adjustFooter() {
    var height = $(".bottom").height();
    var y      = $(".bottom").offset().top;
    if ($(window).height() >= (height + y)) {
      $(".bottom").css("top", $(window).height() - height);
    } else {
      $(".bottom").css("top", start_at);
    }
  }
  
  var selectables = $(".post_item").map(function(index, element) { return element.id }).get();
  
  if (start_at < $(window).height()) {
    $(window).resize(adjustFooter);
    adjustFooter();
  }
  
  $("code").addClass("prettyprint");
  prettyPrint();
  
  function focus(direction) {
    var focused = $(".post_item.focused");
    if (!focused.get(0))
      return;
    $(".code-view").css("display", "none");
    
    if (focused.hasClass("closed")) {
      focused.removeClass("closed");
    } else {
      focused.removeClass("focused");
      var index = selectables.indexOf(focused.attr("id"));
      if (direction == "next") {
        index = index + 1;
        if (index >= selectables.length)
          index = 0;
      } else {
        index = index - 1;
        if (index <= -1)
          index = selectables.length - 1;
      }
      var id = selectables[index];
      focused = $("#" + id);
    }
    if (focused) {
      focused.addClass("focused");
      var code_id = focused.attr("id") + "-code";
      var code = $("#" + code_id);
      if (code.get(0)) {
        code.css("display", "block");
        var top = ($(window).height()/2) - focused.height() - code.height()/2;
        var offset = focused.offset().top - top;
        $(window).scrollTop(offset);
      } else {
        loadCode(focused);
      }
    }
  }
  
  function focusNext() {
    return focus("next");
  }
  function focusPrev() {
    return focus("prev");
  }
  
  function loadCode(focused) {
    var url = $("> a", focused).attr("href");
    var code_id = focused.attr("id") + "-code";
    $.ajax({
      url: url,
      dataType: "text",
      success: function(data) {
        var already_processed = $(".prettyprint");
        already_processed.removeClass("prettyprint");
        var code_view = $("<pre id='" + code_id + "' class='code-view'><code class='prettyprint'></code></pre>");
        $("code", code_view).text(data);
        focused.after(code_view);
        //prettyPrint();
        already_processed.addClass("prettyPrint");
        var top = ($(window).height()/2) - focused.height() - code_view.height()/2;
        var offset = focused.offset().top - top;
        $(window).scrollTop(offset);
      }
    });
  }
  
  $(".post_item").click(function() {
    $(".code-view").css("display", "none");
    $(".focused").removeClass("focused");
    $(this).addClass("focused");
  });
  
  $(window).bind("keydown", "return", function() {
    var focused = $(".focused");
    if (focused) {
      if (focused.hasClass("selected")) {
        $.cachedCommons.list.deselect(focused);
      } else {
        $.cachedCommons.list.select(focused);
      }
    }
      
  });
  
  $(window).bind("keydown", "right", function() {
    focusNext();
    return false;
  });
  $(window).bind("keydown", "left", function() {
    var focused = $(".post_item.focused");
    if (!focused.get(0))
      return;
    focused.addClass("closed");
    $(".code-view").css("display", "none");
    return false;
  });
  $(window).bind("keydown", "up", function() {
    var focused = $(".post_item.focused");
    if (!focused.get(0))
      return;
    $(".code-view").css("display", "none");
    
    focused.removeClass("closed");
    focused.removeClass("focused");
    var index = selectables.indexOf(focused.attr("id")) - 1;
    if (index <= -1)
      index = selectables.length - 1;
    var id = selectables[index];
    focused = $("#" + id);
    if (focused) {
      focused.addClass("closed");
      focused.addClass("focused");
      var top = ($(window).height()/2) - focused.height();
      var offset = focused.offset().top - top;
      $(window).scrollTop(offset);
    }
    return false;
  });
  $(window).bind("keydown", "down", function() {
    
      var focused = $(".post_item.focused");
      if (!focused.get(0))
        return;
      $(".code-view").css("display", "none");

      focused.removeClass("closed");
      focused.removeClass("focused");
      var index = selectables.indexOf(focused.attr("id")) + 1;
      if (index >= selectables.length)
        index = 0;
      var id = selectables[index];
      focused = $("#" + id);
      if (focused) {
        focused.addClass("closed");
        focused.addClass("focused");
        var top = ($(window).height()/2) - focused.height();
        var offset = focused.offset().top - top;
        $(window).scrollTop(offset);
      }
      return false;
  });
  $(".document").click(function() {
    $(".post_item").removeClass("focused");
  })
  
  if (hash && hash != "") {
    hash = hash.match(/-post$/) ? hash : (hash + "-post");
    alert(hash);
    window.location.hash = hash + "-post";
  }
});