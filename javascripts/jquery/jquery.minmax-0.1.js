/**
 * jQMinMax     http://davecardwell.co.uk/javascript/jquery/plugins/jquery-minmax/
 *
 * @author      Dave Cardwell <http://davecardwell.co.uk/>
 * @version     0.1
 *
 * @projectDescription  Add min-/max- height & width support.
 *
 * Built on the shoulders of giants:
 *   * John Resig      - http://jquery.com/
 *
 *
 * Copyright (c) 2006 Dave Cardwell, licensed under the MIT License:
 *   * http://www.opensource.org/licenses/mit-license.php
 */


new function() {
    $.minmax = {
        active: false,
        native: false
    };


    $(document).ready(function() {
        // Create a div to test for native minmax support.
        var test = document.createElement('div');
        $(test).css({
                'width': '1px',
            'min-width': '2px'
        });
        $('body').append(test);

        // In compliant browsers, the min-width of 2px should overwrite the
        // width of 1px.
        $.minmax.native = ( test.offsetWidth && test.offsetWidth == 2 );

        // Tidy up.
        $(test).remove();

        // Go no further if minmax is supported natively.
        if( $.minmax.native )
            return;


        // Use jQMinMax.
        $.minmax.active = true;

        // Set up the minmax jQuery expressions.
        $.minmax.expressions();


        // Use the plugin on all elements where a min/max CSS style is set.
        $(':minmax').minmax();
    });



    /**
     * Set up the minmax jQuery expressions.
     *
     * @example $.minmax.expressions();
     *
     * @name $.minmax.expressions
     * @cat  jQMinMax
     */
    $.minmax.expressions = function() {
        // p for 'properties'.
        var p = new Array( 'min-width', 'min-height',
                           'max-width', 'max-height' );

        // This will hold the components of an uber selector for grabbing
        // anything with a minmax value.
        var minmax = new Array();

        for( var i = 0; i < p.length; i++ ) {
            // Build the expression.
            var expr = "$.css(a,'" + p[i] + "')!='0px'&&"
                     + "$.css(a,'" + p[i] + "')!='auto'&&"
                     + "$.css(a,'" + p[i] + "')!=window.undefined";

            // max-width / max-height can also have the value 'none'.
            if( p[i].charAt(2) == 'x' )
                expr += "&&$.css(a,'" + p[i] + "')!='none'";

            // Add the expression to jQuery.
            $.expr[':'][ p[i] ] = expr;

            // Add the expression to the ':minmax' expression.
            minmax[i] = '(' + expr + ')';
        }

        // Build and add the ':minmax' expression.
        $.expr[':']['minmax'] = minmax.join('||');
    };



    /**
     * Check the given elements for height/width values that fall outside
     * their min/max constraints and update them appropriately.
     *
     * @example $('#foo').minmax();
     *
     * @name $.fn.minmax();
     * @cat  jQMinMax
     */
    $.fn.minmax = function() {
        return $(this).each(function() {
            // Get the min/max constraints of the current element.
            var constraint = {
                'min-width':  calculate( this, 'min-width'  ),
                'max-width':  calculate( this, 'max-width'  ),
                'min-height': calculate( this, 'min-height' ),
                'max-height': calculate( this, 'max-height' )
            };

            // Determine its current width and height.
            var width  = this.offsetWidth;
            var height = this.offsetHeight;

            var newWidth  = width;
            var newHeight = height;


            // If the element is wider than its max-width...
            if( constraint['max-width'] != window.undefined
             && newWidth > constraint['max-width'] )
                newWidth = constraint['max-width'];

            // If the element is/is now thinner than its min-width...
            if( constraint['min-width'] != window.undefined
             && newWidth < constraint['min-width'] )
                newWidth = constraint['min-width'];

            // If the element is taller than its max-height...
            if( constraint['max-height'] != window.undefined
             && newHeight > constraint['max-height'] )
                newHeight = constraint['max-height'];

            // If the element is/is now shorter than its min-height...
            if( constraint['min-height'] != window.undefined
             && newHeight < constraint['min-height'] )
                newHeight = constraint['min-height'];


            // Update the proportions of the current element as required.
            if( newWidth  != width )
                $(this).css( 'width',  newWidth  );
            if( newHeight != height )
                $(this).css( 'height', newHeight );
        });
    };



    // Calculate the computed numeric value of a CSS length value.
    function calculate( obj, p ) {
        var raw = $(obj).css( p );

        // Nothing in, nothing out.
        if( raw == window.undefined || raw == 'auto' )
            return window.undefined;

        var result;

        // Is it a percentage value?
        result = raw.match(/^\+?(\d*(?:\.\d+)?)%$/);
        if( result ) {
            return Math.round(
                Number(
                    (
                        /width$/.test(p) ? $(obj).parent().get(0).offsetWidth
                                         : $(obj).parent().get(0).offsetHeight
                    )
                    * result[1]
                    / 100
                )
            );
        }


        // Is it a straight pixel value?
        result = raw.match(/^\+?(\d*(?:\.\d+)?)(?:px)?$/);
        if( result ) {
            return Number( result[1] );
        }


        // Garbage in, nothing out.
        return window.undefined;
    }
}();