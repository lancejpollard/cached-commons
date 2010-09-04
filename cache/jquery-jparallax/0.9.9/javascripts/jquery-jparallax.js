// jquery.jparallax.js
// 0.9.9
// Stephen Band
//
// Dependencies:
// jQuery 1.2.6 (jquery.com)
//
// Project and documentation site:
// http://webdev.stephband.info/parallax.html


// CLOSURE

(function(jQuery) {


// PRIVATE FUNCTIONS

function stripFiletype(ref) {
  var x=ref.replace('.html', '');
  return x.replace('#', '');
}

function initOrigin(l) {
  if (l.xorigin=='left')	{l.xorigin=0;}	else if (l.xorigin=='middle' || l.xorigin=='centre' || l.xorigin=='center')	{l.xorigin=0.5;}	else if (l.xorigin=='right')	{l.xorigin=1;}
  if (l.yorigin=='top')		{l.yorigin=0;}	else if (l.yorigin=='middle' || l.yorigin=='centre' || l.yorigin=='center')	{l.yorigin=0.5;}	else if (l.yorigin=='bottom')	{l.yorigin=1;}
}

function positionMouse(mouseport, localmouse, virtualmouse) {

  var difference = {x: 0, y: 0, sum: 0};
  
	// Set where the virtual mouse is, if not on target
  if (!mouseport.ontarget) {
    
    // Calculate difference
    difference.x    = virtualmouse.x - localmouse.x;
    difference.y    = virtualmouse.y - localmouse.y;
    difference.sum  = Math.sqrt(difference.x*difference.x + difference.y*difference.y);
    
    // Reset virtualmouse
    virtualmouse.x = localmouse.x + difference.x * mouseport.takeoverFactor;
    virtualmouse.y = localmouse.y + difference.y * mouseport.takeoverFactor;
    
    // If mouse is inside the takeoverThresh set ontarget to true
    if (difference.sum < mouseport.takeoverThresh && difference.sum > mouseport.takeoverThresh*-1) {
    	mouseport.ontarget=true;
    }
  }
  // Set where the layer is if on target
  else {
    virtualmouse.x = localmouse.x;
    virtualmouse.y = localmouse.y;
  }
}

function setupPorts(viewport, mouseport) {

	var offset = mouseport.element.offset();
		
  jQuery.extend(viewport, {
    width: 		viewport.element.width(),
    height: 	viewport.element.height()
  });
  
  jQuery.extend(mouseport, {
    width:		mouseport.element.width(),
    height:		mouseport.element.height(),
    top:			offset.top,
    left:			offset.left
  });
}

function parseTravel(travel, origin, dimension) {
  
  var offset;
  var cssPos;
  
  if (typeof(travel) === 'string') {
    if (travel.search(/^\d+\s?px$/) != -1) {
      travel = travel.replace('px', '');
      travel = parseInt(travel, 10);
      // Set offset constant used in moveLayers()
      offset = origin * (dimension-travel);
      // Set origin now because it won't get altered in moveLayers()
      cssPos = origin * 100 + '%';   
      return {travel: travel, travelpx: true, offset: offset, cssPos: cssPos};
    }
    else if (travel.search(/^\d+\s?%$/) != -1) {
      travel.replace('%', '');
      travel = parseInt(travel, 10) / 100;
    }
    else {
      travel=1;
    }
  }
  // Set offset constant used in moveLayers()
  offset = origin * (1 - travel);
  return {travel: travel, travelpx: false, offset: offset}
}

function setupLayer(layer, i, mouseport) {

  var xStuff;
  var yStuff;
  var cssObject = {};

  layer[i]=jQuery.extend({}, {
  	width:		layer[i].element.width(),
  	height:		layer[i].element.height()
  }, layer[i]);

  xStuff = parseTravel(layer[i].xtravel, layer[i].xorigin, layer[i].width);
  yStuff = parseTravel(layer[i].ytravel, layer[i].yorigin, layer[i].height);

  jQuery.extend(layer[i], {
  	// Used in triggerResponse
  	diffxrat:    mouseport.width / (layer[i].width - mouseport.width),
  	diffyrat:    mouseport.height / (layer[i].height - mouseport.height),
  	// Used in moveLayers
  	xtravel:     xStuff.travel,
  	ytravel:     yStuff.travel,
  	xtravelpx:   xStuff.travelpx,
  	ytravelpx:   yStuff.travelpx,
  	xoffset:     xStuff.offset,
  	yoffset:     yStuff.offset
  });
  
  // Set origin now if it won't be altered in moveLayers()
  if (xStuff.travelpx) {cssObject.left = xStuff.cssPos;}
  if (yStuff.travelpx) {cssObject.top = yStuff.cssPos;}
  if (xStuff.travelpx || yStuff.travelpx) {layer[i].element.css(cssObject);}
}

function setupLayerContents(layer, i, viewportOffset) {

  var contentOffset;

  // Give layer a content object
  jQuery.extend(layer[i], {content: []});
  // Layer content: get positions, dimensions and calculate element offsets for centering children of layers
  for (var n=0; n<layer[i].element.children().length; n++) {
	  
	  if (!layer[i].content[n])          layer[i].content[n]             = {};
	  if (!layer[i].content[n].element)  layer[i].content[n]['element']  = layer[i].element.children().eq(n);
	  
	  // Store the anchor name if one has not already been specified.  You can specify anchors in Layer Options rather than html if you want.
    if(!layer[i].content[n].anchor && layer[i].content[n].element.children('a').attr('name')) {
    	layer[i].content[n]['anchor'] = layer[i].content[n].element.children('a').attr('name');
	  }
	  
	  // Only bother to store child's dimensions if child has an anchor.  What's the point otherwise?
	  if(layer[i].content[n].anchor) {
      contentOffset = layer[i].content[n].element.offset();
	  	jQuery.extend(layer[i].content[n], {
	  		width: 		layer[i].content[n].element.width(),
	  		height:		layer[i].content[n].element.height(),
	  		x:			  contentOffset.left - viewportOffset.left,
	  		y:			  contentOffset.top - viewportOffset.top
	  	});
	  	jQuery.extend(layer[i].content[n], { 
	  	  posxrat:  (layer[i].content[n].x + layer[i].content[n].width/2) / layer[i].width,
	  	  posyrat:  (layer[i].content[n].y + layer[i].content[n].height/2) / layer[i].height
      });
	  }
  }
}

function moveLayers(layer, xratio, yratio) {

	var xpos;
	var ypos;
	var cssObject;
	
	for (var i=0; i<layer.length; i++) {
    
    // Calculate the moving factor
  	xpos = layer[i].xtravel * xratio + layer[i].xoffset;
    ypos = layer[i].ytravel * yratio + layer[i].yoffset;
    cssObject = {};
  	// Do the moving by pixels or by ratio depending on travelpx
    if (layer[i].xparallax) {
      if (layer[i].xtravelpx) {
        cssObject.marginLeft = xpos * -1 + 'px';
      } 
      else {
        cssObject.left = xpos * 100 + '%';
        cssObject.marginLeft = xpos * layer[i].width *-1 + 'px';
      }
	  }
	  if (layer[i].yparallax) {
      if (layer[i].ytravelpx) {
        cssObject.marginTop = ypos * -1 + 'px';
      }
      else {
        cssObject.top = ypos * 100 + '%';
        cssObject.marginTop = ypos * layer[i].height * -1 + 'px';
      }
    }
    layer[i].element.css(cssObject);
	}
}

// PLUGIN DEFINITION **********************************************************************

jQuery.fn.jparallax = function(options) {
	
	// Organise settings into objects (Is this a bit of a mess, or is it efficient?)
	var settings = jQuery().extend({}, jQuery.fn.jparallax.settings, options);
	var settingsLayer = {
  			xparallax:				settings.xparallax,
  			yparallax:				settings.yparallax,
  			xorigin:					settings.xorigin,
  			yorigin:					settings.yorigin,
  			xtravel:          settings.xtravel,
  			ytravel:          settings.ytravel
  		};
  var settingsMouseport = {
  			element:					settings.mouseport,
				takeoverFactor:		settings.takeoverFactor,
				takeoverThresh:		settings.takeoverThresh
			};
	if (settings.mouseport) settingsMouseport['element'] = settings.mouseport;
	
	// Populate layer array with default settings
	var layersettings = [];
	for(var a=1; a<arguments.length; a++) {
		layersettings.push( jQuery.extend( {}, settingsLayer, arguments[a]) );
	}
	
	// Iterate matched elements
	return this.each(function() {

    // VAR
    
		var localmouse = {
					x:				0.5,
					y:				0.5
		};
		
    var virtualmouse = {
					x:				0.5,
					y:				0.5
		};
		
		var timer = {
		  running:		false,
		  frame:			settings.frameDuration,
		  fire:				function(x, y) {
		  	  				  positionMouse(mouseport, localmouse, virtualmouse);
                    moveLayers(layer, virtualmouse.x, virtualmouse.y);
		  	  				  this.running = setTimeout(function() {
		  	  				  	if ( localmouse.x!=x || localmouse.y!=y || !mouseport.ontarget ) {
		  	  				  		timer.fire(localmouse.x, localmouse.y);
		  	  				  	}
		  	  				  	else if (timer.running) {
		  	  				  		timer.running=false;
		  	  				  	}
		  	  				  }, timer.frame);
		  	  				}
		};

		var viewport	=	{element: jQuery(this)};		

		var mouseport = jQuery.extend({}, {element: viewport.element}, settingsMouseport, {
		  xinside:          false,		// is the mouse inside the mouseport's dimensions?
			yinside:	        false,
			active:		        false,		// are the mouse coordinates still being read?
			ontarget:         false			// is the top layer inside the takeoverThresh?
		});
    
		var layer			= [];
    
    // FUNCTIONS
    
    function matrixSearch(layer, ref, callback) {
      for (var i=0; i<layer.length; i++) {
        var gotcha=false;
        for (var n=0; n<layer[i].content.length; n++) {
          if (layer[i].content[n].anchor==ref) {
            callback(i, n);
            return [i, n];
          }
        }
      }
      return false;
    }
    
    // RUN
    
    setupPorts(viewport, mouseport);
		
		// Cycle through and create layers
    for (var i=0; i<viewport.element.children().length; i++) {
			// Create layer from settings if it doesn't exist
			layer[i]=jQuery.extend({}, settingsLayer, layersettings[i], {
				element:	viewport.element.children('*:eq('+i+')')
			});
			
		  setupLayer(layer, i, mouseport);
      
      if (settings.triggerResponse) {
		    setupLayerContents(layer, i, viewport.element.offset());
		  }
		}
		
		
    
    // Set up layers CSS and initial position
    viewport.element.children().css('position', 'absolute');
		moveLayers(layer, 0.5, 0.5);
		
		// Mouse Response
		if (settings.mouseResponse) {
			jQuery().mousemove(function(mouse){
				// Is mouse inside?
				mouseport.xinside = (mouse.pageX >= mouseport.left && mouse.pageX < mouseport.width+mouseport.left) ? true : false;
				mouseport.yinside = (mouse.pageY >= mouseport.top  && mouse.pageY < mouseport.height+mouseport.top)  ? true : false;
				// Then switch active on.
				if (mouseport.xinside && mouseport.yinside && !mouseport.active) {
					mouseport.ontarget = false;
					mouseport.active = true;
				}
				// If active is on give localmouse coordinates
				if (mouseport.active) {
					if (mouseport.xinside) { localmouse.x = (mouse.pageX - mouseport.left) / mouseport.width; }
					else { localmouse.x = (mouse.pageX < mouseport.left) ? 0 : 1; }
					if (mouseport.yinside) { localmouse.y = (mouse.pageY - mouseport.top) / mouseport.height; } 
					else { localmouse.y = (mouse.pageY < mouseport.top) ? 0 : 1; }
				}
				
				// If mouse is inside, fire timer
				if (mouseport.xinside && mouseport.yinside)  { if (!timer.running) timer.fire(localmouse.x, localmouse.y); }
				else if (mouseport.active) { mouseport.active = false; }			
			});
		}
		
		// Trigger Response
		if (settings.triggerResponse) {
		  viewport.element.bind("jparallax", function(event, ref){
		    
		    ref = stripFiletype(ref);
		          
        matrixSearch(layer, ref, function(i, n) {
          localmouse.x = layer[i].content[n].posxrat * (layer[i].diffxrat + 1) - (0.5 * layer[i].diffxrat);
          localmouse.y = layer[i].content[n].posyrat * (layer[i].diffyrat + 1) - (0.5 * layer[i].diffyrat);
  
          if (!settings.triggerExposesEdges) {
            if (localmouse.x < 0) localmouse.x = 0;
            if (localmouse.x > 1) localmouse.x = 1;
            if (localmouse.y < 0) localmouse.y = 0;
            if (localmouse.y > 1) localmouse.y = 1;
          }
          
          mouseport.ontarget = false;
          
          if (!timer.running) timer.fire(localmouse.x, localmouse.y);
        });
		  });
		}
		
		// Window Resize Response
		jQuery(window).resize(function() {

		  setupPorts(viewport, mouseport);
		  for (var i=0; i<layer.length; i++) {
		    setupLayer(layer, i, mouseport);
      }
		});
		
		
	});
};

// END OF PLUGIN DEFINITION **********************************************************************

// PLUGIN DEFAULTS

jQuery.fn.jparallax.settings = {
	mouseResponse:		    true,						// Sets mouse response
	mouseActiveOutside:		false,					// Makes mouse affect layers from outside of the mouseport. 
	triggerResponse:	    true,					  // Sets trigger response
  triggerExposesEdges:  false,          // Sets whether the trigger pulls layer edges into view in trying to centre layer content.
	xparallax:				    true,						// Sets directions to move in
	yparallax:				    true,						//
	xorigin:					    0.5,				    // Sets default alignment - only comes into play when travel is not 1
	yorigin:					    0.5,				    //
	xtravel:              1,              // Factor by which travel is amplified
	ytravel:              1,              //
	takeoverFactor:		    0.65,						// Sets rate of decay curve for catching up with target mouse position
	takeoverThresh:		    0.002,					// Sets the distance within which virtualmouse is considered to be on target, as a multiple of mouseport width.
	frameDuration:        25							// In milliseconds
};

// RUN

initOrigin(jQuery.fn.jparallax.settings);

jQuery(function() {
	
});


// END CLOSURE

})(jQuery);