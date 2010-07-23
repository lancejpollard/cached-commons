(function($) {
  $.cachedCommons = {
    watchWindow: function() {
      var $window = $(window);      
      function positionFixed() {
        var top = $window.scrollTop() + ($window.height() / 2) - ($.cachedCommons.settings.code_button.height() / 2);
        $.cachedCommons.settings.code_button.css("top", top + "px");
      }
      positionFixed();
      $window.scroll(positionFixed);
    },
    searchable: function() {
      $(".post").each(function(index, element) {
        $('input.tags', element).liveUpdate($('.posts', element), function() {
          return $("> a", this).text().toLowerCase() + $("> small", this).text().toLowerCase();
        })
      });
    	$("form").ajaxForm();
    },
    trackable: function() {
      $("a").click(function() {
        $.trackEvent("Link Clicked", "click", $(this).attr("href"));
      });
    },
    scriptable: function() {
      $.cachedCommons.settings.code_button.click(function() { $.cachedCommons.box.show(); });

      $(".options a").click(function() {
        var link = $(this).attr("href").replace("/", "");
        $.cachedCommons.controls[link]();
        return false;
      });
    },
    selectable: function() {
    	$(".post_item").click(function() {
    	  var target = $(event.target);
    	  if (target.is("li")) {
    	    if (target.hasClass("selected")) {
    	      $.cachedCommons.list.deselect(target);
    	    } else {
    	      $.cachedCommons.list.select(target);
    	    }
    	    return false;
    	  }
    	});
    },
    home: function() {
    	// only for the home page
    	if (window.location.pathname == "/") {
    	  $(".downloadable").css("visibility", "visible").css("opacity", 0).animate({opacity:1}, 400);
    	  $(".how-to").css("display", "block");
    	}
    },
    settings: {},
    setup: function(options) {
      $.cachedCommons.settings = options;
      
      var button = $.cachedCommons.settings.code_button = $("<figure class='view-code'>Copy Tags</figure>");
      button.css("opacity", 0)
      button.css("display", "none");
      $(".document").append(button);
      
      $.cachedCommons.classify();
    },
    classify: function() {
      $(".content > ul").each(function(index, element) {
        var list = $(element);
        list.addClass("posts");

        // var cloned_list = list.clone();
        // cloned_list.css("display", "none");
        // list.append(cloned_list);

        $("> li", list).each(function(j_index, j_element) {
          var item = $(j_element);
          var link = $("> a", item);
          var tags = link.attr("title");
          if (tags && tags != "") {
            link.after("<small class='tags'>" + tags + "</small>");
          }
          link.after("<a href='" + link.attr("href").replace(/\.js$/, "-min.js") + "'>(min)</a>");
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
    },
    scripts: [],
    select_count: 0,
    code_button: {
      show: function() {
        var button = $.cachedCommons.settings.code_button;
	      if (button.css("display") == "none") {
	        button.css("display", "block");
	      }
	      button.stop().animate({opacity:1}, 300);
      },
      hide: function() {
        var button = $.cachedCommons.settings.code_button;
	      button.stop().animate({opacity:0}, 300);
      }
    },
    list: {
      attributes: function(target) {
  	    var id = target.attr("id");
  	    var selector_id = "#" + id + "_selector";
        var url = "http://cachedcommons.org" + $("> a", target).attr("href");
        var script_tag = '<script src="' + url + '" type="text/javascript"></script>';
        return {id:id, selector_id:selector_id, url:url, script_tag:script_tag};
      },
      script_for: function(target) {
  	    var id = target.attr("id");
        var url = "http://cachedcommons.org" + $("> a", target).attr("href");
        var script_tag = '<script src="' + url + '" type="text/javascript"></script>';
        return script_tag;
      },
      items: function() {
        
      },
      // 1. changes bar background
      // 2. adds to scripts array
      // 3. adds class to list item
      select: function(target) {
        if (target.hasClass("selected"))
          return;
          
        // 0. calculate attributes
        var attributes = $.cachedCommons.list.attributes(target);
        
        // 1. set class
        target.addClass("selected");
        
        // 2. show selector
	      $(attributes.selector_id).css("visibility", "visible");
	      
	      $.cachedCommons.select_count++;

	      // 3. show code button
	      if ($.cachedCommons.select_count == 1)
	        $.cachedCommons.code_button.show();
      },
      deselect: function(target) {
        var attributes = $.cachedCommons.list.attributes(target);
        
  	    // 1. set class
  	    target.removeClass("selected");
  	    
  	    // 2. hide selector
  	    $(attributes.selector_id).css("visibility", "hidden");
  	    
  	    $.cachedCommons.select_count--;
  	    
  	    // 3. hide code button
  	    if ($.cachedCommons.select_count == 0) {
  	      $.cachedCommons.code_button.hide();
  	    }
      },
      selected: function() {
        return $(".post_item.selected");
      },
      deselected: function() {
        return $(".post_item").not(".selected");
      },
      selectAll: function() {
        
      },
      deselectAll: function() {
        $(".post_item").each(function(index, element) {
          $.cachedCommons.list.deselect($(element));
        });
        $.cachedCommons.select_count = 0;
      }
    },
    box: {
      set: function() {
        $.cachedCommons.list.selected().each(function(index, element) {
          var script_tag = $.cachedCommons.list.script_for($(element));
  	      if ($.cachedCommons.scripts.indexOf(script_tag) == -1) {
            $.cachedCommons.scripts.push(script_tag);
          }
        });
        
	      var code = $("code", $.cachedCommons.settings.code);
  	    code.addClass("with-code");
	      code.text($.cachedCommons.scripts.join("\n"));
      },
      clear: function() {
        $.cachedCommons.scripts = [];
	      var code = $("code", $.cachedCommons.settings.code);
  	    code.text("");
      },
      select: function() {
        
      },
      show: function() {
        var options = $.cachedCommons.settings.controls;
        options.css("display", "block");
        
        $(".how-to").hide();
        
        var code    = $.cachedCommons.settings.code;
        
        $.cachedCommons.box.clear();
        $.cachedCommons.box.set();
        
        var box     = $.cachedCommons.settings.box;
        box.css("display", "block").val($("code", code).text());
        
        var new_height = (code.height() * 1.05) + 20;
        box.stop().animate({height:new_height, opacity:1}, 200);
        
        $('html, body').stop().animate({scrollTop:0}, 300, function() {
          box.select();
        });
      },
      hide: function() {
        var box = $.cachedCommons.settings.box;
        box.stop().animate({height:0}, 300, function() {
          $.cachedCommons.box.clear();
          box.css("display", "none");
          var options = $.cachedCommons.settings.controls;
          options.css("display", "none");
          $.cachedCommons.list.deselectAll();
        });
      }
    },
    controls: {
      state: "html",
      all: function() {
        $.cachedCommons.list.deselected().each(function(index, element) {
          $.cachedCommons.list.select($(element));
        });
        
        $.cachedCommons.box.show();
      },
      clear: function() {
        $.cachedCommons.box.hide();
      },
      html: function() {
        if ($.cachedCommons.controls.state == "html")
          return;
          
        var box = $.cachedCommons.settings.box;
        var code = $("code", code).text();
        alert(code)
      },
      haml: function() {
        if ($.cachedCommons.controls.state == "haml")
          return;
        
      },
      rails: function() {
        if ($.cachedCommons.controls.state == "rails")
          return;
        
      }
    }
  };
})(jQuery);