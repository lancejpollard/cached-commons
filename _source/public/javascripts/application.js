// http://stackoverflow.com/questions/1134976/jquery-sort-list-items-alphabetically
$(document).ready(function() {
  var script_input = $(".code code");

  $view_code = $("<figure class='view-code'>Copy Tags</figure>");
  $view_code.css("opacity", 0)
  $view_code.css("display", "none");
  $(".document").append($view_code);
  $view_code.click(function() {
    //$(".options").css("display", "block");
    $("textarea.code").css("display", "block").val(script_input.text());
    var new_height = $("div.code").height() * 1.2;
    $("textarea.code").animate({height:new_height, opacity:1}, 200);
    $('html, body').animate({scrollTop:0}, 300, function() {
      $("textarea.code").select();
    })
    
  });
  
  $(".options a").click(function() {
    var link = $(this).attr("href").replace("/", "");
    if (link == "all") {
    }
    return false;
  });
  
  $(".content > ul").each(function(index, element) {
    var list = $(element);
    list.addClass("posts");
    
    // var cloned_list = list.clone();
    // cloned_list.css("display", "none");
    // list.append(cloned_list);
    
    $("> li", list).each(function(j_index, j_element) {
      var item = $(j_element);
      var link = $("> a", item);
      link.after("<a href='" + link.attr("href").replace(/\.js$/, "-min.js") + "'>(min)</a>)");
      
      var title = link.text();
      var id = title.toLowerCase().replace(/[\s|\-|\_]+/g, "-");
      item.attr("id", id);
      item.prepend("<div class='selector' id='" + id + "_selector'>selected</div>");
      item.addClass("post_item");
    });
    
    $("a", list).each(function(j_index, j_element) {
      $(j_element).attr("target", "_blank");
    });
    
  });
  
  var pushed_scripts_index = {};
  var pushed_scripts = [];
  
	$(".post_item").click(function() {
	  var target = $(event.target);
	  if (target.is("li")) {
	    var id = target.attr("id");
	    var selector_id = "#" + id + "_selector";
      var url = "http://cachedcommons.org" + $("> a", target).attr("href");
      var script_tag = '<script src="' + url + '" type="text/javascript"></script>';
	    if (target.hasClass("selected")) {
	      target.removeClass("selected");
	      $(selector_id).css("visibility", "hidden");
	      pushed_scripts.splice(pushed_scripts.indexOf(script_tag), 1);
	      delete pushed_scripts_index[id];
	      script_input.text(pushed_scripts.join("\n"));
	    } else {
	      target.addClass("selected");
	      $(selector_id).css("visibility", "visible");
	      if ($view_code.css("display") == "none") {
	        $view_code.css("display", "block").animate({opacity:1}, 300);
	      }
	      if (!pushed_scripts_index[id]) {
  	      pushed_scripts.push(script_tag);
  	      pushed_scripts_index[id] = pushed_scripts.length - 1;
    	    script_input.addClass("with-code");
  	      script_input.text(pushed_scripts.join("\n"));
	      }
	    }
	    return false;
	  }
	});
	
	$("form").ajaxForm();
	
	if (window.location.pathname == "/")
	  $(".downloadable").css("visibility", "visible").css("opacity", 0).animate({opacity:1}, 400);

  $("textarea").labelify({
    labelledClass: "label-highlight"
  });
  
  var $window = $(window);
  
  $window.scroll(function() {
    positionFixed();
  });
  
  function positionFixed() {
    var top = $window.scrollTop() + ($window.height() / 2) - ($view_code.height() / 2);
    $view_code.css("top", top + "px");
  }
  
  positionFixed();
  
});
