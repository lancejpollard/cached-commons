/* fontAvailable jQuery Plugin, v1.1
 *
 * Copyright (c) 2009, Howard Rauscher
 * Licensed under the MIT License
 */
 
(function($) {
	var element;
	
    $.fontAvailable = function(fontName) {
        var width, height;
        
        // prepare element, and append to DOM
        if(!element) {
            element = $( document.createElement( 'span' ))
                .css( 'visibility', 'hidden' )
                .css( 'position', 'absolute' )
                .css( 'top', '-10000px' )
                .css( 'left', '-10000px' )
                .html( 'abcdefghijklmnopqrstuvwxyz' )
                .appendTo( document.body );
        }
        
        // get the width/height of element after applying a fake font
        width = element
            .css('font-family', '__FAKEFONT__')
            .width();
        height = element.height();
        
        // set test font
        element.css('font-family', fontName);
        
        return width !== element.width() || height !== element.height();
    }
})(jQuery);