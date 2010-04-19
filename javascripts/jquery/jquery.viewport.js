/*
 * Viewport - jQuery selectors for finding elements in viewport
 *
 * Copyright (c) 2008 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *  http://www.appelsiini.net/projects/viewport
 *
 * Revision: $Id: jquery.viewport.js 319 2008-02-04 13:00:56Z tuupola $
 *
 */
(function($) {
    
    $.belowthefold = function(element, settings) {
        var fold = $(window).height() + $(window).scrollTop();
        return fold <= $(element).offset().top - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var top = $(window).scrollTop();
        return top >= $(element).offset().top - settings.threshold;
    };
    
    $.rightofscreen = function(element, settings) {
        var fold = $(window).width() + $(window).scrollLeft();
        return fold <= $(element).offset().left - settings.threshold;
    };
    
    $.leftofscreen = function(element, settings) {
        var left = $(window).scrollLeft();
        return left >= $(element).offset().left - settings.threshold;
    };
    
    $.inviewport = function(element, settings) {
        return !$.rightofscreen(element, settings) && !$.leftofscreen(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
    };
    
    
    $.extend($.expr[':'], {
        "below-the-fold": function(a, i, m) {
            return jQuery.belowthefold(a, {threshold : 0});
        },
        "above-the-top": function(a, i, m) {
            return jQuery.abovethetop(a, {threshold : 0});
        },
        "left-of-screen": function(a, i, m) {
            return jQuery.leftofscreen(a, {threshold : 0});
        },
        "right-of-screen": function(a, i, m) {
            return jQuery.rightofscreen(a, {threshold : 0});
        },
        "in-viewport": function(a, i, m) {
            return jQuery.inviewport(a, {threshold : 0});
        }
    });
    
})(jQuery);