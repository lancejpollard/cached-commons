// http://www.zachstronaut.com/posts/2009/02/22/jquery-patch-css-transform.html
// http://github.com/zachstronaut/jquery-css-transform/blob/master/jquery-css-transform.js
(function ($) {
    // Monkey patch jQuery 1.3.1+ css() method to support CSS 'transform'
    // property uniformly across Webkit/Safari/Chrome and Firefox 3.5.
    // 2009 Zachary Johnson www.zachstronaut.com
    function getTransformProperty(element)
    {
        // Try transform first for forward compatibility
        var properties = ['transform', 'WebkitTransform', 'MozTransform'];
        var p;
        while (p = properties.shift())
        {
            if (typeof element.style[p] != 'undefined')
            {
                return p;
            }
        }
        
        // Default to transform also
        return 'transform';
    }
    
    var proxied = $.fn.css;
    $.fn.css = function (arg)
    {
        // Find the correct browser specific property and setup the mapping using
        // $.props which is used internally by jQuery.attr() when setting CSS
        // properties via either the css(name, value) or css(properties) method.
        // The problem with doing this once outside of css() method is that you
        // need a DOM node to find the right CSS property, and there is some risk
        // that somebody would call the css() method before body has loaded or any
        // DOM-is-ready events have fired.
        if
        (
            typeof $.props['transform'] == 'undefined'
            &&
            (
                arg == 'transform'
                ||
                (
                    typeof arg == 'object'
                    && typeof arg['transform'] != 'undefined'
                )
            )
        )
        {
            $.props['transform'] = getTransformProperty(this.get(0));
        }
        
        // We force the property mapping here because jQuery.attr() does
        // property mapping with jQuery.props when setting a CSS property,
        // but curCSS() does *not* do property mapping when *getting* a
        // CSS property.  (It probably should since it manually does it
        // for 'float' now anyway... but that'd require more testing.)
        if (arg == 'transform')
        {
            arg = $.props['transform'];
        }
        
        return proxied.apply(this, arguments);
    };
})(jQuery);

// http://github.com/zachstronaut/jquery-animate-css-rotate-scale/blob/master/jquery-animate-css-rotate-scale.js
// http://www.zachstronaut.com/posts/2009/08/07/jquery-animate-css-rotate-scale.html
(function ($) {
    // Monkey patch jQuery 1.3.1+ to add support for setting or animating CSS
    // scale and rotation independently.
    // 2009 Zachary Johnson www.zachstronaut.com
    var rotateUnits = 'deg';
    
    $.fn.rotate = function (val)
    {
        var style = $(this).css('transform') || 'none';
        
        if (typeof val == 'undefined')
        {
            if (style)
            {
                var m = style.match(/rotate\(([^)]+)\)/);
                if (m && m[1])
                {
                    return m[1];
                }
            }
            
            return 0;
        }
        
        var m = val.toString().match(/^(-?\d+(\.\d+)?)(.+)?$/);
        if (m)
        {
            if (m[3])
            {
                rotateUnits = m[3];
            }
            
            $(this).css(
                'transform',
                style.replace(/none|rotate\([^)]*\)/, '') + 'rotate(' + m[1] + rotateUnits + ')'
            );
        }
    }

		$.fn.rotation = function ()
		{
			var m = $(this).rotate().toString().match(/^(\d+).*$/);
			return (m && m[1]) ? parseFloat(m[1]) : 0;
		}
    
    // Note that scale is unitless.
    $.fn.scale = function (val, duration, options)
    {
        var style = $(this).css('transform');
        
        if (typeof val == 'undefined')
        {
            if (style)
            {
                var m = style.match(/scale\(([^)]+)\)/);
                if (m && m[1])
                {
                    return m[1];
                }
            }
            
            return 1;
        }
        
        $(this).css(
            'transform',
            style.replace(/none|scale\([^)]*\)/, '') + 'scale(' + val + ')'
        );
    }

    // fx.cur() must be monkey patched because otherwise it would always
    // return 0 for current rotate and scale values
    var curProxied = $.fx.prototype.cur;
    $.fx.prototype.cur = function ()
    {
        if (this.prop == 'rotate')
        {
            return parseFloat($(this.elem).rotate());
        }
        else if (this.prop == 'scale')
        {
            return parseFloat($(this.elem).scale());
        }
        
        return curProxied.apply(this, arguments);
    }
    
    $.fx.step.rotate = function (fx)
    {
        $(fx.elem).rotate(fx.now + rotateUnits);
    }
    
    $.fx.step.scale = function (fx)
    {
        $(fx.elem).scale(fx.now);
    }
    
    /*
    
    Starting on line 3905 of jquery-1.3.2.js we have this code:
    
    // We need to compute starting value
    if ( unit != "px" ) {
        self.style[ name ] = (end || 1) + unit;
        start = ((end || 1) / e.cur(true)) * start;
        self.style[ name ] = start + unit;
    }
    
    This creates a problem where we cannot give units to our custom animation
    because if we do then this code will execute and because self.style[name]
    does not exist where name is our custom animation's name then e.cur(true)
    will likely return zero and create a divide by zero bug which will set
    start to NaN.
    
    The following monkey patch for animate() gets around this by storing the
    units used in the rotation definition and then stripping the units off.
    
    */
    
    var animateProxied = $.fn.animate;
    $.fn.animate = function (prop)
    {
        if (typeof prop['rotate'] != 'undefined')
        {
            var m = prop['rotate'].toString().match(/^(([+-]=)?(-?\d+(\.\d+)?))(.+)?$/);
            if (m && m[5])
            {
                rotateUnits = m[5];
            }
            
            prop['rotate'] = m[1];
        }
        
        return animateProxied.apply(this, arguments);
    }
})(jQuery);