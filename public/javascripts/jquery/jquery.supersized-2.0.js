/*
Supersized - Fullscreen Slideshow jQuery Plugin
By Sam Dunn (www.buildinternet.com // www.onemightyroar.com)
Version: supersized.2.0.js // Relase Date: 5/7/09
Website: www.buildinternet.com/project/supersized
Thanks to Aen for preloading, fade effect, & vertical centering
*/

(function($){

	//Resize image on ready or resize
	$.fn.supersized = function() {
		$.inAnimation = false;
		$.paused = false;
		var options = $.extend($.fn.supersized.defaults, $.fn.supersized.options);
		
		$(window).bind("load", function(){
			$('#loading').hide();
			$('#supersize').fadeIn('fast');
			$('#content').show();
			if ($('#slideshow .activeslide').length == 0) $('#supersize a:first').addClass('activeslide');
			if (options.slide_captions == 1) $('#slidecaption').html($('#supersize .activeslide').find('img').attr('title'));
			if (options.navigation == 0) $('#navigation').hide();
			//Slideshow
			if (options.slideshow == 1){
				if (options.slide_counter == 1){ //Initiate slide counter if active
					$('#slidecounter .slidenumber').html(1);
	    			$('#slidecounter .totalslides').html($("#supersize > *").size());
	    		}
				slideshow_interval = setInterval("nextslide()", options.slide_interval);
				if (options.navigation == 1){ //Skip if no navigation
					$('#navigation a').click(function(){  
   						$(this).blur();  
   						return false;  
   					}); 	
					//Slide Navigation
				    $('#nextslide').click(function() {
				    	if($.paused) return false; if($.inAnimation) return false;
					    clearInterval(slideshow_interval);
					    nextslide();
					    slideshow_interval = setInterval(nextslide, options.slide_interval);
					    return false;
				    });
				    $('#prevslide').click(function() {
				    	if($.paused) return false; if($.inAnimation) return false;
				        clearInterval(slideshow_interval);
				        prevslide();
				        slideshow_interval = setInterval(nextslide, options.slide_interval);
				        return false;
				    });
					$('#nextslide img').hover(function() {
						if($.paused == true) return false;
					   	$(this).attr("src", "images/forward.gif");
					}, function(){
						if($.paused == true) return false;
					    $(this).attr("src", "images/forward_dull.gif");
					});
					$('#prevslide img').hover(function() {
						if($.paused == true) return false; 
					    $(this).attr("src", "images/back.gif");
					}, function(){
						if($.paused == true) return false;
					    $(this).attr("src", "images/back_dull.gif");
					});
					
				    //Play/Pause Button
				    $('#pauseplay').click(function() {
				    	if($.inAnimation) return false;
				    	var src = ($(this).find('img').attr("src") === "images/play.gif") ? "images/pause.gif" : "images/play.gif";
      					if (src == "images/pause.gif"){
      						$(this).find('img').attr("src", "images/play.gif");
      						$.paused = false;
					        slideshow_interval = setInterval(nextslide, options.slide_interval);  
				        }else{
				        	$(this).find('img').attr("src", "images/pause.gif");
				        	clearInterval(slideshow_interval);
				        	$.paused = true;
				        }
      					$(this).find('img').attr("src", src);
					    return false;
				    });
				    $('#pauseplay').mouseover(function() {
				    	var imagecheck = ($(this).find('img').attr("src") === "images/play_dull.gif");
				    	if (imagecheck){
      						$(this).find('img').attr("src", "images/play.gif"); 
				        }else{
				        	$(this).find('img').attr("src", "images/pause.gif");
				        }
				    });
				    
				    $('#pauseplay').mouseout(function() {
				    	var imagecheck = ($(this).find('img').attr("src") === "images/play.gif");
				    	if (imagecheck){
      						$(this).find('img').attr("src", "images/play_dull.gif"); 
				        }else{
				        	$(this).find('img').attr("src", "images/pause_dull.gif");
				        }
				        return false;
				    });
				}
			}
		});
				
		$(document).ready(function() {
			$('#supersize').resizenow(); 
		});
		
		//Pause when hover on image
		$('#supersize > *').hover(function() {
	   		if (options.slideshow == 1 && options.pause_hover == 1){
	   			if(!($.paused) && options.navigation == 1){
	   				$('#pauseplay > img').attr("src", "images/pause.gif"); 
	   				clearInterval(slideshow_interval);
	   			}
	   		}
	   		original_title = $(this).find('img').attr("title");
	   		if($.inAnimation) return false; else $(this).find('img').attr("title","");
	   	}, function() {
			if (options.slideshow == 1 && options.pause_hover == 1){
				if(!($.paused) && options.navigation == 1){
					$('#pauseplay > img').attr("src", "images/pause_dull.gif");
					slideshow_interval = setInterval(nextslide, options.slide_interval);
				} 
			}
			$(this).find('img').attr("title", original_title);	
	   	});
		
		$(window).bind("resize", function(){
    		$('#supersize').resizenow(); 
		});
		
		$('#supersize').hide();
		$('#content').hide();
	};
	
	//Adjust image size
	$.fn.resizenow = function() {
		var options = $.extend($.fn.supersized.defaults, $.fn.supersized.options);
	  	return this.each(function() {
	  		
			//Define image ratio
			var ratio = options.startheight/options.startwidth;
			
			//Gather browser and current image size
			var imagewidth = $(this).width();
			var imageheight = $(this).height();
			var browserwidth = $(window).width();
			var browserheight = $(window).height();
			var offset;

			//Resize image to proper ratio
			if ((browserheight/browserwidth) > ratio){
			    $(this).height(browserheight);
			    $(this).width(browserheight / ratio);
			    $(this).children().height(browserheight);
			    $(this).children().width(browserheight / ratio);
			} else {
			    $(this).width(browserwidth);
			    $(this).height(browserwidth * ratio);
			    $(this).children().width(browserwidth);
			    $(this).children().height(browserwidth * ratio);
			}
			if (options.vertical_center == 1){
				$(this).children().css('left', (browserwidth - $(this).width())/2);
				$(this).children().css('top', (browserheight - $(this).height())/2);
			}
			return false;
		});
	};
	
	$.fn.supersized.defaults = { 
			startwidth: 4,  
			startheight: 3,
			vertical_center: 1,
			slideshow: 1,
			navigation:1,
			transition: 1, //0-None, 1-Fade, 2-slide top, 3-slide right, 4-slide bottom, 5-slide left
			pause_hover: 0,
			slide_counter: 1,
			slide_captions: 1,
			slide_interval: 5000
	};
	
})(jQuery);

	//Slideshow Next Slide
	function nextslide() {
		if($.inAnimation) return false;
		else $.inAnimation = true;
	    var options = $.extend($.fn.supersized.defaults, $.fn.supersized.options);
	    var currentslide = $('#supersize .activeslide');
	    currentslide.removeClass('activeslide');
		
	    if ( currentslide.length == 0 ) currentslide = $('#supersize a:last');
			
	    var nextslide =  currentslide.next().length ? currentslide.next() : $('#supersize a:first');
	    var prevslide =  nextslide.prev().length ? nextslide.prev() : $('#supersize a:last');
		
		
		//Display slide counter
		if (options.slide_counter == 1){
			var slidecount = $('#slidecounter .slidenumber').html();
			currentslide.next().length ? slidecount++ : slidecount = 1;
		    $('#slidecounter .slidenumber').html(slidecount);
		}
		
		$('.prevslide').removeClass('prevslide');
		prevslide.addClass('prevslide');
		
		//Captions require img in <a>
	    if (options.slide_captions == 1) $('#slidecaption').html($(nextslide).find('img').attr('title'));
		
	    nextslide.hide().addClass('activeslide')
	    	if (options.transition == 0){
	    		nextslide.show(); $.inAnimation = false;
	    	}
	    	if (options.transition == 1){
	    		nextslide.fadeIn(750, function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 2){
	    		nextslide.show("slide", { direction: "up" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 3){
	    		nextslide.show("slide", { direction: "right" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 4){
	    		nextslide.show("slide", { direction: "down" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 5){
	    		nextslide.show("slide", { direction: "left" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	
	    $('#supersize').resizenow();//Fix for resize mid-transition
	    
	}
	
	//Slideshow Previous Slide
	function prevslide() {
		if($.inAnimation) return false;
		else $.inAnimation = true;
	    var options = $.extend($.fn.supersized.defaults, $.fn.supersized.options);
	    var currentslide = $('#supersize .activeslide');
	    currentslide.removeClass('activeslide');
		
	    if ( currentslide.length == 0 ) currentslide = $('#supersize a:first');
			
	    var nextslide =  currentslide.prev().length ? currentslide.prev() : $('#supersize a:last');
	    var prevslide =  nextslide.next().length ? nextslide.next() : $('#supersize a:first');
		
		//Display slide counter
		if (options.slide_counter == 1){
			var slidecount = $('#slidecounter .slidenumber').html();
			currentslide.prev().length ? slidecount-- : slidecount = $("#supersize > *").size();
		    $('#slidecounter .slidenumber').html(slidecount);
		}
		
		$('.prevslide').removeClass('prevslide');
		prevslide.addClass('prevslide');
		
		//Captions require img in <a>
	    if (options.slide_captions == 1) $('#slidecaption').html($(nextslide).find('img').attr('title'));
		
	    nextslide.hide().addClass('activeslide')
	    	if (options.transition == 0){
	    		nextslide.show(); $.inAnimation = false;
	    	}
	    	if (options.transition == 1){
	    		nextslide.fadeIn(750, function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 2){
	    		nextslide.show("slide", { direction: "down" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 3){
	    		nextslide.show("slide", { direction: "left" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 4){
	    		nextslide.show("slide", { direction: "up" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 5){
	    		nextslide.show("slide", { direction: "right" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	
	    	$('#supersize').resizenow();//Fix for resize mid-transition
	}