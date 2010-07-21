// http://stackoverflow.com/questions/1134976/jquery-sort-list-items-alphabetically
$(document).ready(function() {
  
  $(".content > ul").each(function(index, element) {
    var list = $(element);
    list.addClass("posts");
    
    // var cloned_list = list.clone();
    // cloned_list.css("display", "none");
    // list.append(cloned_list);
    
    $("> li", list).each(function(j_index, j_element) {
      var item = $(j_element);
      var title = $("> a", item).text();
      var id = title.toLowerCase().replace(/[\s|\-|\_]+/g, "-");
      item.attr("id", id);
      item.prepend("<div class='selector' id='" + id + "_selector'>selected</div>");
      item.addClass("post_item");
    });
    
    $("a", list).each(function(j_index, j_element) {
      $(j_element).attr("target", "_blank");
    });
    
  });
  
	$(".post_item").click(function() {
	  var target = $(event.target);
	  if (target.is("li")) {
	    var selector_id = "#" + target.attr("id") + "_selector";
	    if (target.hasClass("selected")) {
	      target.removeClass("selected");
	      $(selector_id).css("visibility", "hidden");
	    } else {
	      target.addClass("selected");
	      $(selector_id).css("visibility", "visible");
	    }
	    return false;
	  }
	});
	
	$("form").ajaxForm();
	
	if (window.location.pathname == "/")
	  $(".downloadable").css("visibility", "visible").css("opacity", 0).animate({opacity:1}, 400);
	
//  $('#source').quicksand( $('#destination li'), {
//  	name: ""
//  });
});
