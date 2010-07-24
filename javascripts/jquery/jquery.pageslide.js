(function($){
  $.fn.pageSlide = function(options) {
    
    var settings = $.extend({
		    width:          "300px", // Accepts fixed widths
		    duration:       "normal", // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
		    direction:      "left", // default direction is left.
		    modal:          false, // if true, the only way to close the pageslide is to define an explicit close class. 
		    _identifier: $(this)
		}, options);
		
		// these are the minimum css requirements for the pageslide elements introduced in this plugin.
		
		var pageslide_slide_wrap_css = {
		  position: 'fixed',
      width: '0',
      top: '0',
      height: '100%',
      zIndex:'999'
		};
		
		var pageslide_body_wrap_css = {
		  position: 'relative',
		  zIndex: '0'
		};
		
		var pageslide_blanket_css = { 
	    position: 'absolute',
	    top: '0px',
	    left: '0px',
	    height: '100%',
	    width: '100%', 
	    opacity: '0.0',
	    backgroundColor: 'black',
	    zIndex: '1',
	    display: 'none'
	  };
		
		function _initialize(anchor) {
      
      // Create and prepare elements for pageSlide
      if ($("#pageslide-body-wrap, #pageslide-content, #pageslide-slide-wrap").size() == 0) {
        
        var psBodyWrap = document.createElement("div");
        $(psBodyWrap).css(pageslide_body_wrap_css);
        $(psBodyWrap).attr("id","pageslide-body-wrap").width( $("body").width() );
        $("body").contents().wrapAll( psBodyWrap );
  	    
        var psSlideContent = document.createElement("div");
        $(psSlideContent).attr("id","pageslide-content").width( settings.width );

        var psSlideWrap = document.createElement("div");
        $(psSlideWrap).css(pageslide_slide_wrap_css);
        $(psSlideWrap).attr("id","pageslide-slide-wrap").append( psSlideContent );
        $("body").append( psSlideWrap );
  	    
      }
      
      // introduce the blanket if modal option is set to true.
      if ($("#pageslide-blanket").size() == 0 && settings.modal == true) {
        var psSlideBlanket = document.createElement("div");
        $(psSlideBlanket).css(pageslide_blanket_css);
        $(psSlideBlanket).attr("id","pageslide-blanket");
        $("body").append( psSlideBlanket );
  	    $("#pageslide-blanket").click(function(){ return false; });
      }
          	    
	    // Callback events for window resizing
	    $(window).resize(function(){
        $("#pageslide-body-wrap").width( $("body").width() );
      });
      
      // mark the anchor!
      $(anchor).attr("rel","pageslide");
      
	  };
	  
		function _openSlide(elm) {
		  if($("#pageslide-slide-wrap").width() != 0) return false;
		  _showBlanket();
		  // decide on a direction
		  if (settings.direction == "right") {
		    direction = {right:"-"+settings.width};
		    $("#pageslide-slide-wrap").css({left:0});
        _overflowFixAdd();
		  } 
		  else {
		    direction = {left:"-"+settings.width};
		    $("#pageslide-slide-wrap").css({right:0});
		  }
    	$("#pageslide-slide-wrap").animate({width: settings.width}, settings.duration);
		  $("#pageslide-body-wrap").animate(direction, settings.duration, function() {
	      $.ajax({
  		      type: "GET",
  		      url: $(elm).attr("href"),
  		      success: function(data){
  		        $("#pageslide-content").css("width",settings.width).html(data)
  		          .queue(function(){
  		            $(this).dequeue();
  		            
  		            // add hook for a close button
  		            $(this).find('.pageslide-close').unbind('click').click(function(elm){
  		              _closeSlide(elm);
  		              $(this).find('pageslide-close').unbind('click');
  		            });
  		          });
  		      }
  		    });
		  });
		};
		
		function _closeSlide(event) {
		  if ($(event)[0].button != 2 && $("#pageslide-slide-wrap").css('width') != "0px") { // if not right click.
        $.fn.pageSlideClose(settings);
      }
		};
		
		// this is used to activate the modal blanket, if the modal setting is defined as true.
		function _showBlanket() {
	    if(settings.modal == true) {
	      $("#pageslide-blanket").toggle().animate({opacity:'0.8'}, 'fast','linear');
	    }
	  };

	  // fixes an annoying horizontal scrollbar.
	  function _overflowFixAdd(){($.browser.msie) ? $("body, html").css({overflowX:'hidden'}) : $("body").css({overflowX:'hidden'});}
		
    // Initalize pageslide, if it hasn't already been done.
    _initialize(this);
    return this.each(function(){
      $(this).unbind("click").bind("click", function(){
    	  _openSlide(this);
    	  $("#pageslide-slide-wrap").unbind('click').click(function(e){ if(e.target.tagName != "A") return false; });	  
    	  if (settings.modal != true) {
  	      $(document).unbind('click').click(function(e) { if(e.target.tagName != "A"){ _closeSlide(e); return false } });
  	    }
    	  return false;
    	});	
    });
    
  };
})(jQuery);

// pageSlideClose allows the system to automatically close any pageslide that is currently open in the view.
(function($){
  $.fn.pageSlideClose = function(options) {
    
    var settings = $.extend({
		    width:          "300px", // Accepts fixed widths
		    duration:       "normal", // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
		    direction:      "left", // default direction is left.
		    modal:          false, // if true, the only way to close the pageslide is to define an explicit close class. 
		    _identifier: $(this)
		}, options);
		
		function _hideBlanket() { if(settings.modal == true && $("#pageslide-blanket").is(":visible")) {
      $("#pageslide-blanket").animate({opacity:'0.0'}, 'fast','linear',function(){$(this).hide();});
    }}
    
    function _overflowFixRemove(){($.browser.msie) ? $("body, html").css({overflowX:''}) : $("body").css({overflowX:''});}
		
    _hideBlanket();
    direction = ($("#pageslide-slide-wrap").css("left") != "0px") ? {left: "0"} : {right: "0"};
	  $("#pageslide-body-wrap").animate(direction, settings.duration);
    $("#pageslide-slide-wrap").animate({width: "0"}, settings.duration, function() {
      // clear bug
      $("#pageslide-content").css("width","0px").empty();
      $('#pageslide-body-wrap, #pageslide-slide-wrap').css('left','');
      $('#pageslide-body-wrap, #pageslide-slide-wrap').css('right','');
      _overflowFixRemove();
    });
    
  }
})(jQuery);

// this adds the ability to close pageSlide with the 'escape' key, if not modal.
(function($){
  $(document).ready(function(){
    $(document).keyup(function(event){
      if (!$("#pageslide-blanket").is(":visible") && event.keyCode == 27) $.fn.pageSlideClose();
    });
  });
})(jQuery);