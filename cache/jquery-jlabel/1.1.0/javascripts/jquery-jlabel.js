// ####################################################################################
// #######                                                                      #######
// ####### Plugin:      jLabel                                                  #######
// ####### Author:      William Duffy                                           #######
// ####### Website:     http://www.wduffy.co.uk/jLabel                          #######
// ####### Version:     1.1                                                     #######
// #######                                                                      #######
// ####### Copyright (c) 2010, William Duffy - www.wduffy.co.uk                 #######
// #######                                                                      #######
// ####### Permission is hereby granted, free of charge, to any person          #######
// ####### obtaining a copy of this software and associated documentation       #######
// ####### files (the "Software"), to deal in the Software without              #######
// ####### restriction, including without limitation the rights to use,         #######
// ####### copy, modify, merge, publish, distribute, sublicense, and/or sell    #######
// ####### copies of the Software, and to permit persons to whom the            #######
// ####### Software is furnished to do so, subject to the following             #######
// ####### conditions:                                                          #######
// #######                                                                      #######
// ####### The above copyright notice and this permission notice shall be       #######
// ####### included in all copies or substantial portions of the Software.      #######
// #######                                                                      #######
// ####### THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,      #######
// ####### EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES      #######
// ####### OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND             #######
// ####### NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT          #######
// ####### HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,         #######
// ####### WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING         #######
// ####### FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR        #######
// ####### OTHER DEALINGS IN THE SOFTWARE.                                      #######
// #######                                                                      #######
// ####################################################################################
(function($) {
    
    // Public: jLabel Plugin
    $.fn.jLabel = function(options) {

        var states = new Array();
        var opts = $.extend({}, $.fn.jLabel.defaults, options);

        return this.each(function() {
            $this = $(this);

            states.push(new state($this));

            $this
                .focus(function() { focus($(this)); })
                .blur(function() { blur($(this)); })
                .keyup(function() { keyup($(this)); });
        });

        // Private: state object
        function state($input) {

            // Public Method: equals
            this.equals = function($input) {
                return $input.attr('id') == this.input.attr('id');
            };

            // Public Properties
            this.input = $input;
            this.label = getLabel($input);                     
            
            // Construction code
            if (this.input.val() != '') this.label.fadeTo(0, 0);

        };

        // Private: Get an input's related state
        function getState($input) {
            var state; 

            $.each(states, function() {
                if (this.equals($input)) {
                    state = this;
                    return false; // Stop the jQuery loop running
                };
            });

			return state;
        };

        // Private: Get an input's related label, or create a new one if none found
        function getLabel($input) {
			
			// Get the label related to the passed input
			var $label = $('label[for=' + $input.attr('id') + ']');

			// If no label has been found create one
			if ($label.size() == 0) {
				$label = $('<label>')
                                .attr('for', $input.attr('id'))
                                .text($input.attr('title'));
			};
			
			// If this is a new label insert it into the DOM, if not then move it directly before it's related input
			$input.before($label);

			// Style the label to mimic it's textbox formatting
			$label
				.css({
					'font-family' 	    : $input.css('font-family'),
					'font-size' 	    : $input.css('font-size'),
					'font-style' 	    : $input.css('font-style'),
					'font-variant' 	    : $input.css('font-variant'),
					'font-weight' 	    : $input.css('font-weight'),
                    'letter-spacing' 	: $input.css('letter-spacing'),
                    'line-height' 	    : $input.css('line-height'),
                    'text-decoration' 	: $input.css('text-decoration'),
                    'text-transform' 	: $input.css('text-transform'),
					'color' 		    : $input.css('color'),
					'cursor' 		    : $input.css('cursor'),
					'display' 		    : 'inline-block'
				});

			// Stop the label from being selectable and position it relative to it's input
            $label
					.mousedown(function() { return false; })
					.css({
						'position' 		: 'relative',
						'z-index' 		: '100',
						'margin-right' 	: -$label.width(),
						'left' 			: opts.xShift + parseInt($input.css("padding-left")) + 'px',
						'top'			: opts.yShift + 'px'
					});

            return $label;
        };

        // Private: Toggle label opacity on input focus
        function focus($input) {
            if ($input.val() == '') {
                getState($input).label.stop().fadeTo(opts.speed, opts.opacity);
			};
        };

        // Private: Toggle label opacity on input blur
        function blur($input) {
            if ($input.val() == '') {
                getState($input).label.stop().fadeTo(opts.speed, 1);
			};
        };

        // Private: Toggle label opacity on input key up
        function keyup($input) {			
			if ($input.val() == '') {
            	getState($input).label.stop().fadeTo(opts.speed, opts.opacity);
			} else {
				getState($input).label.stop().fadeTo(opts.speed, 0);
			};
        };

    };

    // Public: Default values
    $.fn.jLabel.defaults = {
        speed 	: 200,
        opacity : 0.4,
        xShift 	: 2,
        yShift 	: 0
    };

})(jQuery);