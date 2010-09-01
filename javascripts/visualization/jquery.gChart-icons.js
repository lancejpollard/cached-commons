/* http://keith-wood.name/gChart.html
   Google Chart icons extension for jQuery v1.3.1.
   See API details at http://code.google.com/apis/chart/.
   Written by Keith Wood (kbwood{at}iinet.com.au) September 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Mapping from marker placement names to chart drawing placement codes. */
var PLACEMENTS = {center: 'h', centre: 'h', left: 'l', right: 'r', h: 'h', l: 'l', r: 'r'};
/* Mapping from icon tail names to chart tail codes. */
var TAILS = {bottomLeft: 'bb', topLeft: 'bbtl', topRight: 'bbtr', bottomRight: 'bbbr', none: 'bbT',
	bb: 'bb', bbtl: 'bbtl', bbtr: 'bbtr', bbbr: 'bbbr', bbT: 'bbT'};
/* Mapping from icon map pin style names to chart map pin style codes. */
var PIN_STYLES = {none: 'pin', star: 'pin_star', left: 'pin_sleft', right: 'pin_sright'};
/* Mapping from icon shadow names to chart icon shadow codes. */
var SHADOWS = {no: '', yes: '_withshadow', only: '_shadow'};
/* Mapping from icon note types to chart icon note codes. */
var NOTES = {arrow: 'arrow_d', balloon: 'balloon', pinned: 'pinned_c',
	sticky: 'sticky_y', taped: 'taped_y', thought: 'thought'};

$.extend($.gchart, {

	/* Create a bubble icon definition.
	   @param  text      (string) the text content, use '|' for line breaks
	   @param  image     (string, optional) the name of an inset image
	   @param  tail      (string, optional) the type of tail to use
	   @param  large     (boolean, optional) true if a large bubble is required
	   @param  shadow    (string, optional) 'no', 'yes', 'only'
	   @param  bgColour  (string, optional) the icon background's colour
	   @param  colour    (string, optional) the icon text's colour
	   @param  series    (number, optional) the series to which the icon applies
	   @param  item      (number or string or number[2 or 3], optional)
	                     the item in the series to which it applies or 'all' (default)
	                     or 'everyn' or [start, end, every]
	   @param  zIndex    (number, optional) the z-index (-1.0 to 1.0)
	   @param  position  (number[2], optional) an absolute chart position (0.0 to 1.0)
	   @param  offsets   (number[2], optional) pixel offsets
	   @return  (object) the icon definition */
	bubbleIcon: function(text, image, tail, large, shadow, bgColour, colour,
			series, item, zIndex, position, offsets) {
		if (typeof image == 'boolean') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = colour;
			series = bgColour;
			colour = shadow;
			bgColour = large;
			shadow = tail;
			large = image;
			tail = null;
			image = null;
		}
		else if (typeof image == 'number') {
			offsets = bgColour;
			position = shadow;
			zIndex = large;
			item = tail;
			series = image;
			colour = null;
			bgColour = null;
			shadow = null;
			large = null;
			tail = null;
			image = null;
		}
		if (typeof tail == 'boolean') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = colour;
			colour = bgColour;
			bgColour = shadow;
			shadow = large;
			large = tail;
			tail = null;
		}
		else if (typeof tail == 'number') {
			offsets = colour;
			position = bgColour;
			zIndex = shadow;
			item = large;
			series = tail;
			colour = null;
			bgColour = null;
			shadow = null;
			large = null;
			tail = null;
		}
		if (typeof large == 'number') {
			offsets = series;
			position = colour;
			zIndex = bgColour;
			item = shadow;
			series = large;
			colour = null;
			bgColour = null;
			shadow = null;
			large = null;
		}
		if (typeof shadow == 'number') {
			offsets = item;
			position = series;
			zIndex = colour;
			item = bgColour;
			series = shadow;
			colour = null;
			bgColour = null;
			shadow = null;
		}
		if (typeof bgColour == 'number') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = colour;
			series = bgColour;
			colour = null;
			bgColour = null;
		}
		if (typeof colour == 'number') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = colour;
			colour = null;
		}
		var multiline = text.match(/\|/);
		var colours = this.color(bgColour || 'white') + ',' + this.color(colour || 'black');
		var data = (image ? image + ',' : '') + (TAILS[tail] || 'bb') + ',' +
			(multiline ? colours + ',' : '') + this._escapeIconText(text) +
			(multiline ? '' : ',' + colours);
		return this.icon('bubble' + (image ? '_icon' : '') +
			(multiline || (!image && large) ? '_texts' : '_text') +
			(large || multiline  ? '_big' : '_small') + SHADOWS[shadow || 'yes'],
			data, series, item, zIndex, position, offsets);
	},

	/* Create a map pin icon definition.
	   @param  letter    (string) the single letter to show
	   @param  image     (string, optional) the name of an inset image
	   @param  style     (string, optional) '' or 'none', 'star', 'left', 'right'
	   @param  shadow    (string, optional) 'no', 'yes', 'only'
	   @param  bgColour  (string, optional) the icon background's colour
	   @param  colour    (string, optional) the icon text's colour
	   @param  series    (number, optional) the series to which the icon applies
	   @param  item      (number or string or number[2 or 3], optional)
	                     the item in the series to which it applies or 'all' (default)
	                     or 'everyn' or [start, end, every]
	   @param  zIndex    (number, optional) the z-index (-1.0 to 1.0)
	   @param  position  (number[2], optional) an absolute chart position (0.0 to 1.0)
	   @param  offsets   (number[2], optional) pixel offsets
	   @return  (object) the icon definition */
	mapPinIcon: function(letter, image, style, shadow, bgColour, colour,
			series, item, zIndex, position, offsets) {
		if (typeof image == 'number') {
			offsets = colour;
			position = bgColour;
			zIndex = shadow;
			item = style;
			series = image;
			colour = null;
			bgColour = null;
			shadow = null;
			style = null;
			image = null;
		}
		if (typeof style == 'number') {
			offsets = series;
			position = colour;
			zIndex = bgColour;
			item = shadow;
			series = style;
			colour = null;
			bgColour = null;
			shadow = null;
			style = null;
		}
		if (typeof shadow == 'number') {
			offsets = item;
			position = series;
			zIndex = colour;
			item = bgColour;
			series = shadow;
			colour = null;
			bgColour = null;
			shadow = null;
		}
		if (typeof bgColour == 'number') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = colour;
			series = bgColour;
			colour = null;
			bgColour = null;
		}
		if (typeof colour == 'number') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = colour;
			colour = null;
		}
		var data = (style ? (PIN_STYLES[style] || 'pin') + ',' : '') +
			(image ? image : this._escapeIconText(letter)) + ',' + this.color(bgColour || 'white') +
			(image ? '' : ',' + this.color(colour || 'black'));
		return this.icon('map_' + (style ? 'x' : '') + 'pin' + (image ? '_icon' : '_letter') +
			SHADOWS[shadow || 'yes'], data, series, item, zIndex, position, offsets);
	},

	/* Create a fun note icon definition.
	   @param  title      (string) the note title
	   @param  text       (string, optional) the text content, use '|' for line breaks
	   @param  type       (string, optional) the type of note to display
	   @param  large      (boolean, optional) true if a large note is required
	   @param  alignment  (string, optional) 'left', 'right', 'center'
	   @param  colour     (string, optional) the icon text's colour
	   @param  series     (number, optional) the series to which the icon applies
	   @param  item       (number or string or number[2 or 3], optional)
	                     the item in the series to which it applies or 'all' (default)
	                     or 'everyn' or [start, end, every]
	   @param  zIndex     (number, optional) the z-index (-1.0 to 1.0)
	   @param  position   (number[2], optional) an absolute chart position (0.0 to 1.0)
	   @param  offsets    (number[2], optional) pixel offsets
	   @return  (object) the icon definition */
	noteIcon: function(title, text, type, large, alignment, colour,
			series, item, zIndex, position, offsets) {
		if (typeof text == 'boolean') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = colour;
			series = alignment;
			colour = large;
			alignment = type;
			large = text;
			type = null;
			text = null;
		}
		else if (typeof text == 'number') {
			offsets = colour;
			position = alignment;
			zIndex = large;
			item = type;
			series = text;
			colour = null;
			alignment = null;
			large = null;
			type = null;
			text = null;
		}
		if (typeof type == 'boolean') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = colour;
			colour = alignment;
			alignment = large;
			large = type;
			type = null;
		}
		else if (typeof type == 'number') {
			offsets = series;
			position = colour;
			zIndex = alignment;
			item = large;
			series = type;
			colour = null;
			alignment = null;
			large = null;
			type = null;
		}
		if (typeof large == 'number') {
			offsets = item;
			position = series;
			zIndex = colour;
			item = alignment;
			series = large;
			colour = null;
			alignment = null;
			large = null;
		}
		if (typeof alignment == 'number') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = colour;
			series = alignment;
			colour = null;
			alignment = null;
		}
		if (typeof colour == 'number') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = colour;
			colour = null;
		}
		var data = (NOTES[type] || 'sticky_y') + ',' + (large ? '1' : '2') + ',' +
			this.color(colour || 'black') + ',' + (PLACEMENTS[alignment] || 'h') + ',' +
			(title ? this._escapeIconText(title) + ',' : '') + this._escapeIconText(text || '');
		return this.icon('fnote' + (title ? '_title' : ''),
			data, series, item, zIndex, position, offsets);
	},

	/* Create a weather icon definition.
	   @param  title     (string) the note title
	   @param  text      (string, optional) the text content, use '|' for line breaks
	   @param  type      (string, optional) the type of note to display
	   @param  image     (string, optional) the name of an inset image
	   @param  series    (number, optional) the series to which the icon applies
	   @param  item      (number or string or number[2 or 3], optional)
	                     the item in the series to which it applies or 'all' (default)
	                     or 'everyn' or [start, end, every]
	   @param  zIndex    (number, optional) the z-index (-1.0 to 1.0)
	   @param  position  (number[2], optional) an absolute chart position (0.0 to 1.0)
	   @param  offsets   (number[2], optional) pixel offsets
	   @return  (object) the icon definition */
	weatherIcon: function(title, text, type, image,
			series, item, zIndex, position, offsets) {
		if (typeof text == 'number') {
			offsets = item;
			position = series;
			zIndex = image;
			item = type;
			series = text;
			image = null;
			type = null;
			text = null;
		}
		if (typeof type == 'number') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = image;
			series = type;
			image = null;
			type = null;
		}
		if (typeof image == 'number') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = image;
			image = null;
		}
		var data = (NOTES[type] || 'sticky_y') + ',' + (image || 'sunny') + ',' +
			this._escapeIconText(title || '') + (text ? ',' + this._escapeIconText(text) : '');
		return this.icon('weather', data, series, item, zIndex, position, offsets);
	},

	/* Create a text outline icon definition.
	   @param  text       (string) the text content, use '|' for line breaks
	   @param  size       (number, optional) the text size in pixels
	   @param  bold       (boolean, optional) true for bold
	   @param  alignment  (string, optional) 'left', 'right', 'center'
	   @param  colour     (string, optional) the icon text's fill colour
	   @param  outline    (string, optional) the icon text's outline colour
	   @param  series     (number, optional) the series to which the icon applies
	   @param  item       (number or string or number[2 or 3], optional)
	                     the item in the series to which it applies or 'all' (default)
	                     or 'everyn' or [start, end, every]
	   @param  zIndex     (number, optional) the z-index (-1.0 to 1.0)
	   @param  position   (number[2], optional) an absolute chart position (0.0 to 1.0)
	   @param  offsets    (number[2], optional) pixel offsets
	   @return  (object) the icon definition */
	outlineIcon: function(text, size, bold, alignment, colour, outline,
			series, item, zIndex, position, offsets) {
		if (typeof size == 'boolean') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = outline;
			outline = colour;
			colour = alignment;
			alignment = bold;
			bold = size;
			size = null;
		}
		if (typeof bold == 'number') {
			offsets = series;
			position = outline;
			zIndex = colour;
			item = alignment;
			series = bold;
			outline = null;
			colour = null;
			alignment = null;
			bold = null;
		}
		if (typeof alignment == 'number') {
			offsets = item;
			position = series;
			zIndex = outline;
			item = colour;
			series = alignment;
			outline = null;
			colour = null;
			alignment = null;
		}
		if (typeof colour == 'number') {
			offsets = zIndex;
			position = item;
			zIndex = series;
			item = outline;
			series = colour;
			outline = null;
			colour = null;
		}
		if (typeof outline == 'number') {
			offsets = position;
			position = zIndex;
			zIndex = item;
			item = series;
			series = outline;
			outline = null;
		}
		var data = this.color(colour || 'white') + ',' + (size || 10) + ',' +
			(PLACEMENTS[alignment] || 'h') + ',' + this.color(outline || 'black') + ',' +
			(bold ? 'b' : '_') + ',' + this._escapeIconText(text);
		return this.icon('text_outline', data, series, item, zIndex, position, offsets);
	},

	/* Escape reserved characters in icon text.
	   @param  value  (string) the text to escape
	   @return  (string) the escaped text */
	_escapeIconText: function(value) {
		return value.replace(/([@=,;])/g, '@$1').replace(/\|/g, ',');
	}
});

})(jQuery);
