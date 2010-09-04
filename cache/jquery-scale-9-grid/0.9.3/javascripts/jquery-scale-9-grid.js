/*
 * jQuery 9-Grid Scaling Plugin 0.9.3
 *
 * Copyright (c) 2008 Gordon L. Hempton ( http://hempton.com )
 * Licensed under the MIT license
 */
 (function($) {
	
var supportsBorderImage = false;
var borderImageStyle;

// TODO: we should check webkit's version as well
if($.browser.safari) {
	supportsBorderImage = true;
	borderImageStyle = '-webkit-border-image';
} else if($.browser.mozilla
		// requires firefox 3.1 or greater
		&& $.browser.version.substr(0,3)=="1.9"
		&& parseFloat($.browser.version.substr(3)) > 1.0)  {
	supportsBorderImage = true;
	borderImageStyle = '-moz-border-image';
}
	
$.fn.extend({
	
	scale9Grid: function(settings) {
		
		var gridTop = settings.top || 0;
		var gridBottom = settings.bottom || 0;
		var gridLeft = settings.left || 0;
		var gridRight = settings.right || 0;
	
		return $(this).each(function() {
			
			var $target = $(this);
			
			if($target.data('layoutGrid')) {
				$target.remove9Grid();
			}
			
			var backgroundImage = $target.css('background-image');
			var match = /url\("?([^\(\)"]+)"?\)/i.exec(backgroundImage);
			if(!match || match.length < 2) {
				return;
			}
			var backgroundUrl = match[1];
			
			// ie6 breaks on a floated child with a staticly positioned parent
			if($.browser.msie && $.browser.version < 7 && $target.css('float') != 'none' && $target.css('position') == 'static') {
				$target.css('position', 'relative');
			}
			
			$target.wrapInner('<div class="s9gwrapper"></div>');
			var $wrapper = $target.find('.s9gwrapper');
			$wrapper.css({
				'padding-left': $target.css('padding-left'),
				'padding-right': $target.css('padding-right'),
				'padding-top': $target.css('padding-top'),
				'padding-bottom': $target.css('padding-bottom'),
				'text-align': $target.css('text-align'),
				'position':'relative',
				'z-index':'2',
				'display':'block',
				'background-color':'transparent',
				'background-image':'none'
			});
			
			$target.css({
				'background-color':'transparent',
				'background-image':'none',
				'border-color':'transparent',
				'padding':'0',
				'text-align':'left'
			});
			
			var backgroundElement = document.createElement('div');
			$target.prepend(backgroundElement);
			var $background = $(backgroundElement);
			$background.css({
				'position':'relative',
				'width':'0px',
				'height':'0px',
				'z-index':'0',
				'display':'block'
			});
			$background.addClass('s9gbackground');
			
			if(supportsBorderImage) {
				var cssProperties = {
					'border-width':gridTop + 'px ' + gridRight + 'px ' + gridBottom + 'px ' + gridLeft + 'px ',
					'position':'absolute'
				}
				cssProperties[borderImageStyle] = backgroundImage + ' ' + gridTop + ' ' + gridRight + ' ' + gridBottom + ' ' + gridLeft + ' stretch stretch';
				$background.css(cssProperties);
			}
			
			var imageWidth;
			var imageHeight;
			
			var lastWidth = 0;
			var lastHeight = 0;
			
			var cells = new Array();
			
			var layoutGrid = function() {
				var width = $target.innerWidth();
	            var height = $target.innerHeight();
	            
	            if(width < gridLeft + gridRight || height < gridTop + gridBottom
	            		|| (width == lastWidth && height == lastHeight)) {
	            	return;
	            }
	            
	            if(supportsBorderImage) {
	            	$background.css({
	            		'width':width - gridLeft - gridRight + 'px',
	            		'height':height - gridTop - gridBottom + 'px'
	            	})
	            	return;
	            }
	            
	            lastWidth = width;
	            lastHeight = height;
	            
	            var cellIndex = 0;
	            var existingCells = cells.length;
	            
	            for(var y = 0; y < height;)
	            {
	            	var cellHeight;
	            	var verticalPosition;
	            	if(y == 0) {
	            		verticalPosition = "top";
	            		cellHeight = Math.min(imageHeight - gridBottom, height - gridBottom);
	            	}
	            	else if(y + imageHeight - gridTop >= height) {
	            		verticalPosition = "bottom";
	            		cellHeight = height - y;
	            	}
	            	else {
	            		verticalPosition = "center";
	            		cellHeight = Math.min(imageHeight - gridTop - gridBottom, height - y - gridBottom);
	            	}
	            	
	            	for(var x = 0; x < width; cellIndex++)
	            	{
	            		var $cell;
	            		if(cellIndex < existingCells) {
	            			$cell = cells[cellIndex];
	            		}
	            		else {
	            			cellElement = document.createElement('div');
	            			$background.append(cellElement);
	            			$cell = $(cellElement);
	            			$cell.css({
	            				'position':'absolute',
	            				'background-image':backgroundImage
	            			});
	            			cells.push($cell);
	            		}
	            		
	            		var cellWidth;
	            		var horizontalPosition;
	            		if(x == 0) {
	            			horizontalPosition = "left";
	            			cellWidth = Math.min(imageWidth - gridRight, width - gridRight);
	            		}
	            		else if(x + imageWidth - gridBottom >= width) {
	            			horizontalPosition = "right";
	            			cellWidth = width - x;
	            		}
	            		else {
	            			horizontalPosition = "center";
	            			cellWidth = Math.min(imageWidth - gridLeft - gridRight, width - x - gridRight);
	            		}
	            		
	            		$cell.css({
	            			'left':x + 'px',
	            			'top':y + 'px',
	            			'width':cellWidth + 'px',
	            			'height':cellHeight + 'px',
	            			'background-position':verticalPosition + ' ' + horizontalPosition
	            		});
	            		
	            		x += cellWidth;
	            	}
	            	y += cellHeight;
	            }
	            for( var i = cellIndex; i < existingCells; i++) {
	            	cells[i].remove();
	            }
	            cells.splice(cellIndex, cells.length - cellIndex);
			};
			
			var image = new Image();
			$(image).load(function() {
				if(image.width < gridLeft + gridRight || image.height < gridTop + gridBottom) {
					return; //invalid inputs
				}
				imageWidth = image.width;
				imageHeight = image.height;
				layoutGrid();
				// TODO: should resize when the text size is changed also
				// TODO: this event should be removed if the element is removed from the DOM
				$(window).resize(layoutGrid);
			}).attr('src', backgroundUrl);
			
			$target.data('layoutGrid', layoutGrid);
			
		});
	},
	
	remove9Grid: function() {
		
		return $(this).each(function() {
			
			var $target = $(this);
			
			if(!$target.data('layoutGrid'))
				return;
			
			$(window).unbind('resize', $target.data('layoutGrid'));
			
			// TODO: is there a better way to do this?
			$target.removeAttr('style');
			
			var content = $target.find('.s9gwrapper').contents();
			$target.prepend(content);
			
			$target.find('.s9gwrapper').remove();
			$target.find('.s9gbackground').remove();
			
			$target.removeData('layoutGrid');
		});
	}
	
});

})(jQuery);