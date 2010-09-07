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
          return $("a.src", this).text().toLowerCase() + $("> small", this).text().toLowerCase();
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
    	$(".post_item").click(function(event) {
    	  var target = $(event.target);
    	  if (target.is("summary"))
    	    target = target.parents("li.post_item");
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
      
      var button = $.cachedCommons.settings.code_button = $("#view-code");
      button.text("Copy Tags");
      button.css("opacity", 0);
      button.css("display", "none");
      $(".document").append(button);
      
      if (window.location.pathname == "/")
        $.cachedCommons.classify();
    },
    createClipboard: function(id) {
      ZeroClipboard.setMoviePath('http://' + window.location.host + '/cache/zero-clipboard/1.0.7/swfs/zero-clipboard.swf');
      var clipboard = new ZeroClipboard.Client();
    	clipboard.setHandCursor(true);
    	clipboard.glue(id, id);
    	clipboard.addEventListener("complete", function(client, text) {
    	  $("#view-code").trigger("click");
    	})
    	clipboard.addEventListener("mouseOver", function() {
    	  clipboard.setText($.cachedCommons.getTags().join("\n"));
    	});
    	return clipboard;
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
          
          var link = $(".sources a.src", item);
          var tags = link.attr("title");
          if (tags && tags != "") {
            link.after("<small class='tags'>" + tags + "</small>");
          }
          try {
            link.after("<a href='" + link.attr("href").replace(/\.(js|css)$/, "-min.$1") + "'>(min)</a>");            
          } catch (error) {
            console.log(link.attr("href"));
            console.log("the above link didn't have properly formatted js path!");
          }
          var title = link.text();
          var id = title.toLowerCase().replace(/[\s|\-|\_\.\,]+/g, "-") + "-post";
          item.attr("id", id);
          item.prepend("<div class='selector' id='" + id + "_selector'>selected</div>");
          item.addClass("post_item");
        });

        $("a", list).each(function(j_index, j_element) {
          var link = $(j_element);
          if (!link.hasClass("drilldown"))
            link.attr("target", "_blank");
        });

      });
    },
    scripts: [],
    setScripts: function() {
      $.cachedCommons.list.selected().each(function(index, element) {
        var script_tag = $.cachedCommons.list.script_for($(element));
	      if ($.cachedCommons.scripts.indexOf(script_tag) == -1) {
          $.cachedCommons.scripts.push(script_tag);
        }
      });
    },
    getTags: function() {
      $.cachedCommons.setScripts();
      return $.cachedCommons.scripts;
    },
    select_count: 0,
    code_button: {
      show: function() {
        var button = $.cachedCommons.settings.code_button;
	      if (button.css("display") == "none") {
	        button.css("display", "block");
	      }
	      button.stop().animate({opacity:1}, 300, function() {
          var clipboard = $.cachedCommons.createClipboard('view-code');
          var embed = $("embed");
          var clipboardParent = embed.parent();
	      });
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
        var url = $("a.src", target).attr("href");//"http://cachedcommons.org" + 
        var tag = null;
        if (url.match(/\.css$/)) {
          tag = '<link href="' + url + '" rel="stylesheet" type="text/css"/>';
        } else {
          tag = '<script src="' + url + '" type="text/javascript"></script>';
        }
        return {id:id, selector_id:selector_id, url:url, script_tag:tag};
      },
      script_for: function(target) {
  	    var id = target.attr("id");
        var url = $("a.src", target).attr("href");//"http://cachedcommons.org" + 
        var tag = null;
        if (url.match(/\.css$/)) {
          tag = '<link href="' + url + '" rel="stylesheet" type="text/css"/>';
        } else {
          tag = '<script src="' + url + '" type="text/javascript"></script>';
        }
        return tag;
      },
      items: function() {
        
      },
      // 1. changes bar background
      // 2. adds to scripts array
      // 3. adds class to list item
      select: function(target) {
        $(".post_item").removeClass("focused");
        target.addClass("focused");
        var code_view = $("#code-view");
	      code_view.css("display", "none");
        if (target.hasClass("selected"))
          return;
          
        // 0. calculate attributes
        var attributes = $.cachedCommons.list.attributes(target);

        // 1. set class
        target.addClass("selected");
        
        // 2. show selector
	      $(attributes.selector_id).css("visibility", "visible").css("top", target.position().top + 12);
	      
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
        $.cachedCommons.setScripts();
        
	      var code = $("code", $.cachedCommons.settings.code);
  	    code.addClass("with-code");
	      code.text($.cachedCommons.scripts.sort().join("\n"));
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