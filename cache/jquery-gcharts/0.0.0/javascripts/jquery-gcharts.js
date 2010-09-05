/* http://keith-wood.name/gChart.html
   Google Chart interface for jQuery v1.3.1.
   See API details at http://code.google.com/apis/chart/.
   Written by Keith Wood (kbwood{at}iinet.com.au) September 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

/* Request a chart from Google charts.
   $('div selector').gchart({type: 'pie', series: [$.gchart.series([101, 84])]});
*/

(function($) { // Hide scope, no $ conflict

/* Google Charting manager. */
function GChart() {
	this._defaults = {
		width: 0, // Width of the chart
		height: 0, // Height of the chart
		format: 'png', // Returned format: png, gif
		usePost: false, // True to POST instead of GET - for larger charts with more data
		margins: null, // The minimum margins (pixels) around the chart:
			// all or [left/right, top/bottom] or [left, right, top, bottom]
		title: '', // The title of the chart
		titleColor: '', // The colour of the title
		titleSize: 0, // The font size of the title
		opacity: 0, // Make the entire chart semi-transparent (0.0-1.0 or 0-100)
		backgroundColor: null, // The background colour for the entire image
		chartColor: null, // The background colour for the chart area
		legend: '', // The location of the legend: top, topVertical,
			// bottom, bottomVertical, left, right, or '' for none
		legendOrder: 'normal', // The order of items within a legend: normal, reverse, automatic
		legendSize: null, // The minimum size (pixels) of the legend: [width, height]
		type: 'pie3D', // Type of chart requested: line, lineXY, sparkline,
			// barHoriz, barVert, barHorizGrouped, barVertGrouped, pie, pie3D (default),
			// pieConcentric, venn, scatter, radar, radarCurved, map, meter, qrCode, formula
		encoding: '', // Type of data encoding: text (default), scaled, simple, extended
		series: [this.series('Hello World', [60, 40])], // Details about the values to be plotted
		visibleSeries: 0, // The number of series that are directly displayed, 0 for all
		dataLabels: [], // Labels for the values across all the series
		axes: [], // Definitions for the various axes, each entry is either
			// a string of the axis name or a GChartAxis object
		ranges: [], // Definitions of ranges for the chart, each entry is an object with
			// vertical (boolean), color (string), start (number, 0-1),
			// and end (number, 0-1) attributes
		markers: [], // Definitions of markers for the chart, each entry is an object with
			// shape (arrow, circle, cross, diamond, down, flag, horizontal,
			// number, plus, sparkfill, sparkline, square, text, vertical),
			// color (string), series (number), item (number), size (number),
			// priority (number), text (string), positioned (boolean),
			// placement (string or string[]), offsets (number[2])
		icons: [], // Definitions of dynamic icons for the chart, each entry is an object with
			// name (string), data (string), series (number), item (number), zIndex (number),
			// position (number[2]), offsets (number[2])
		minValue: 0, // The minimum value of the data, $.gchart.calculate to calculate from data
		maxValue: 100, // The maximum value of the data, $.gchart.calculate to calculate from data
		gridSize: [], // The x and y spacings between grid lines
		gridLine: [], // The line and gap lengths for the grid lines
		gridOffsets: [], // The x and y offsets for the grid lines
		extension: {}, // Any custom extensions to the Google chart parameters
		// Bar charts -------------
		barWidth: null, // The width of each bar (pixels) or 'a' for automatic or 'r' for relative
		barSpacing: null, // The space (pixels) between bars in a group
		barGroupSpacing: null, // The space (pixels) between groups of bars
		barZeroPoint: null, // The position (0.0 to 1.0) of the zero-line
		// Pie charts -------------
		pieOrientation: 0, // The angle (degrees) of orientation from the positive x-axis
		// Maps -------------------
		mapArea: 'world', // The general area to show: world,
			// africa, asia, europe, middle_east, south_america, usa
		mapRegions: [], // List of country/state codes to plot
		mapDefaultColor: 'bebebe', // The colour for non-plotted countries/states
		mapColors: ['blue', 'red'], // The colour range for plotted countries/states
		// QR Code ----------------
		qrECLevel: null, // Error correction level: low, medium, quarter, high
		qrMargin: null, // Margin (squares) around QR code, default is 4
		// Callback
		onLoad: null, // Function to call when loaded
		provideJSON: false // True to return JSON description of chart with the onLoad callback
	};
};

/* The name of the data property that holds the instance settings. */
var PROP_NAME = 'gChart';
/* Translations of text colour names into chart values. */
var COLOURS = {aqua: '008080', black: '000000', blue: '0000ff', fuchsia: 'ff00ff', gray: '808080',
	green: '008000', grey: '808080', lime: '00ff00', maroon: '800000', navy: '000080',
	olive: '808000', orange: 'ffa500', purple: '800080', red: 'ff0000', silver: 'c0c0c0',
	teal: '008080', transparent: '00000000', white: 'ffffff', yellow: 'ffff00'};
/* Mapping from plugin chart types to Google chart types. */
var CHART_TYPES = {line: 'lc', lineXY: 'lxy', sparkline: 'ls',
	barHoriz: 'bhs', barVert: 'bvs', barHorizGrouped: 'bhg', barVertGrouped: 'bvg',
	pie: 'p', pie3D: 'p3', pieConcentric: 'pc', venn: 'v', scatter: 's',
	radar: 'r', radarCurved: 'rs', map: 't', meter: 'gom', qrCode: 'qr', formula: 'tx',
	lc: 'lc', lxy: 'lxy', ls: 'ls', bhs: 'bhs', bvs: 'bvs', bhg: 'bhg', bvg: 'bvg',
	p: 'p', p3: 'p3', pc: 'pc', v: 'v', s: 's',
	r: 'r', rs: 'rs', t: 't', gom: 'gom', qr: 'qr', tx: 'tx'};
/* Mapping from plugin shape types to Google chart shapes. */
var SHAPES = {annotation: 'A', arrow: 'a', candlestick: 'F', circle: 'o', cross: 'x',
	diamond: 'd', down: 'v', errorbar: 'E', flag: 'f', financial: 'F', horizbar: 'H',
	horizontal: 'h', number: 'N', plus: 'c', rectangle: 'C', sparkfill: 'B',
	sparkline: 'D', sparkslice: 'b', square: 's', text: 't', vertical: 'V'};
/* Mapping from plugin priority names to chart priority codes. */
var PRIORITIES = {behind: -1, below: -1, normal: 0, above: +1, inFront: +1, '-': -1, '+': +1};
/* Mapping from plugin gradient names to angles. */
var GRADIENTS = {diagonalDown: -45, diagonalUp: 45, horizontal: 0, vertical: 90,
	dd: -45, du: 45, h: 0, v: 90};
/* Mapping from plugin alignment names to chart alignment codes. */
var ALIGNMENTS = {left: -1, center: 0, centre: 0, right: +1, l: -1, c: 0, r: +1};
/* Mapping from plugin drawing control names to chart drawing control codes. */
var DRAWING = {line: 'l', ticks: 't', both: 'lt'};
/* Mapping from legend order names to chart drawing control codes. */
var ORDERS = {normal: 'l', reverse: 'r', automatic: 'a', '': '', l: 'l', r: 'r', a: 'a'};
/* Mapping from marker placement names to chart drawing placement codes. */
var PLACEMENTS = {barbase: 's', barcenter: 'c', barcentre: 'c', bartop: 'e', bottom: 'b',
	center: 'h', centre: 'h', left: 'l', middle: 'v', right: 'r', top: 't',
	b: 'b', c: 'c', e: 'e', h: 'h', l: 'l', r: 'r', s: 's', t: 't', v: 'v'};

/* Characters to use for encoding schemes. */
var SIMPLE_ENCODING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var EXTENDED_ENCODING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.';

$.extend(GChart.prototype, {
	/* Class name added to elements to indicate already configured with Google charting. */
	markerClassName: 'hasGChart',
	
	/* Marker value to indicate min/max calculation from data. */
	calculate: -0.123,
	
	/* Possible values for bar width. */
	barWidthAuto: 'a', // Automatic resize to fill
	barWidthRelative: 'r', // Spacings are relative to bars (0.0 - 1.0)
	
	/* Possible values for number format. */
	formatFloat: 'f',
	formatPercent: 'p',
	formatScientific: 'e',
	formatCurrency: 'c',

	/* Override the default settings for all Google chart instances.
	   @param  options  (object) the new settings to use as defaults */
	setDefaults: function(options) {
		extendRemove(this._defaults, options || {});
	},

	/* Create a new data series.
	   @param  label       (string, optional) the label for this series
	   @param  data        (number[]) the data values for this series
	   @param  colour      (string or string[]) the colour(s) for this series
	   @param  fillColour  (string, optional) the fill colour for this series or
	                       (object, optional) fill slice with attributes color and range ('start:end') or
						   (object[], optional) array of above
	   @param  minValue    (number, optional with maxValue) the minimum value for this series
	   @param  maxValue    (number, optional with minValue) the maximum value for this series
	   @param  thickness   (number) the thickness (pixels) of the line for this series
	   @param  segments    (number[2]) the line and gap lengths (pixels) for this series
	   @return  (object) the new series object */
	series: function(label, data, colour, fillColour, minValue, maxValue, thickness, segments) {
		if ($.isArray(label)) { // Optional label
			segments = thickness;
			thickness = maxValue;
			maxValue = minValue;
			minValue = fillColour;
			fillColour = colour;
			colour = data;
			data = label;
			label = '';
		}
		if (typeof colour == 'number') { // Optional colour/fillColour
			segments = maxValue;
			thickness = minValue;
			maxValue = fillColour;
			minValue = colour;
			fillColour = null;
			colour = null;
		}
		if (typeof fillColour == 'number') { // Optional fillColour
			segments = thickness;
			thickness = maxValue;
			maxValue = minValue;
			minValue = fillColour;
			fillColour = null;
		}
		if ($.isArray(maxValue)) { // Optional min/max values
			segments = maxValue;
			thickness = minValue;
			maxValue = null;
			minValue = null;
		}
		return {label: label, data: data || [], color: colour || '',
			fillColor: fillColour, minValue: minValue, maxValue: maxValue,
			lineThickness: thickness, lineSegments: segments};
	},

	/* Load series data from CSV.
	   Include a header row if fields other than data required.
	   Use these names - label, color, fillColor, minValue, maxValue,
	   lineThickness, lineSegmentLine, lineSegmentGap - for series attributes.
	   Data columns should be labelled ynn, where nn is a sequential number.
	   For X-Y line charts, include xnn columns before corresponding ynn.
	   @param  csv  (string or string[]) the series data in CSV format
	   @return  (object[]) the series definitions */
	seriesFromCsv: function(csv) {
		var seriesData = [];
		if (!$.isArray(csv)) {
			csv = csv.split('\n');
		}
		if (!csv.length) {
			return seriesData;
		}
		var xyData = false;
		var sColumns = [];
		var xColumns = [];
		var fields = ['label', 'color', 'fillColor', 'minValue', 'maxValue',
			'lineThickness', 'lineSegmentLine', 'lineSegmentGap'];
		$.each(csv, function(i, line) {
			var cols = line.split(',');
			if (i == 0 && isNaN(parseFloat(cols[0]))) { // Header row
				$.each(cols, function(i, val) {
					if ($.inArray(val, fields) > -1) { // Note the positions of the columns
						sColumns[i] = val;
					}
					else if (val.match(/^x\d+$/)) { // Column with x-coordinate
						xColumns[i] = val;
					}
				});
			}
			else {
				var series = {};
				var data = [];
				var saveX = null;
				$.each(cols, function(i, val) {
					if (sColumns[i]) { // Non-data value
						var pos = $.inArray(sColumns[i], fields);
						series[sColumns[i]] = (pos > 2 ? $.gchart._numeric(val, 0) : val);
					}
					else if (xColumns[i]) { // X-coordinate
						saveX = (val ? $.gchart._numeric(val, -1) : null);
						xyData = true;
					}
					else {
						var y = $.gchart._numeric(val, -1);
						data.push(saveX != null ? [saveX, y] : y);
						saveX = null;
					}
				});
				if (series.lineSegmentLine != null && series.lineSegmentGap != null) {
					series.lineSegments = [series.lineSegmentLine, series.lineSegmentGap];
					series.lineSegmentLine = series.lineSegmentGap = null;
				}
				seriesData.push($.extend(series, {data: data}));
			}
		});
		return (xyData ? this.seriesForXYLines(seriesData) : seriesData);
	},

	/* Load series data from XML. All attributes are optional except point/@y.
	   <data>
	     <series label="" color="" fillColor="" minValue="" maxValue="" lineThickness="" lineSegments="">
	       <point x="" y=""/>
	       ...
	     </series>
	     ...
	   </data>
	   @param  xml  (string or Document) the XML containing the series data
	   @return  (object[]) the series definitions */
	seriesFromXml: function(xml) {
		if ($.browser.msie && typeof xml == 'string') {
			var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.validateOnParse = false;
			doc.resolveExternals = false;
			doc.loadXML(xml);
			xml = doc;
		}
		xml = $(xml);
		var seriesData = [];
		var xyData = false;
		try {
			xml.find('series').each(function() {
				var series = $(this);
				var data = [];
				series.find('point').each(function() {
					var point = $(this);
					var x = point.attr('x');
					if (x != null) {
						xyData = true;
						x = $.gchart._numeric(x, -1);
					}
					y = $.gchart._numeric(point.attr('y'), -1);
					data.push(x ? [x, y] : y);
				});
				var segments = series.attr('lineSegments');
				if (segments) {
					segments = segments.split(',');
					for (var i = 0; i < segments.length; i++) {
						segments[i] = $.gchart._numeric(segments[i], 1);
					}
				}
				seriesData.push({label: series.attr('label'), data: data,
					color: series.attr('color'), fillColor: series.attr('fillColor'),
					minValue: $.gchart._numeric(series.attr('minValue'), null),
					maxValue: $.gchart._numeric(series.attr('maxValue'), null),
					lineThickness: $.gchart._numeric(series.attr('lineThickness'), null),
					lineSegments: segments});
			});
		}
		catch (e) {
			// Ignore
		}
		return (xyData ? this.seriesForXYLines(seriesData) : seriesData);
	},

	/* Force a value to be numeric.
	   @param  val      (string) the value to convert
	   @param  whenNaN  (number) value to use if not numeric
	   @return  (number) the numeric equivalent or whenNaN if not numeric */
	_numeric: function(val, whenNaN) {
		val = parseFloat(val);
		return (isNaN(val) ? whenNaN : val);
	},

	/* Prepare series for a line XY chart.
	   @param  series  (object[]) the details of the points to plot,
	                   each data value may be an array of two points
	   @return  (object[]) the transformed series
	   @deprecated  in favour of seriesForXYLines */
	lineXYSeries: function(series) {
		return this.seriesForXYLines(series);
	},

	/* Prepare series for a line XY chart.
	   @param  series  (object[]) the details of the points to plot,
	                   each data value may be an array of two points
	   @return  (object[]) the transformed series */
	seriesForXYLines: function(series) {
		var xySeries = [];
		for (var i = 0; i < series.length; i++) {
			var xNull = !$.isArray(series[i].data[0]);
			var xData = (xNull ? [null] : []);
			var yData = [];
			for (var j = 0; j < series[i].data.length; j++) {
				if (xNull) {
					yData.push(series[i].data[j]);
				}
				else {
					xData.push(series[i].data[j][0]);
					yData.push(series[i].data[j][1]);
				}
			}
			xySeries.push($.gchart.series(series[i].label, xData, series[i].color,
				series[i].fillColor, series[i].minValue, series[i].maxValue,
				series[i].lineThickness, series[i].lineSegments));
			xySeries.push($.gchart.series(series[i].label, yData, '',
				series[i].fillColor, series[i].minValue, series[i].maxValue,
				series[i].lineThickness, series[i].lineSegments));
		}
		return xySeries;
	},

	/* Prepare options for a scatter chart.
	   @param  values   (number[][]) the coordinates of the points:
	                    [0] is the x-coord, [1] is the y-coord, [2] is the percentage size
	   @param  labels   (string[]) the labels for the groups (optional)
	   @param  colours  (string[]) the colours for the labels (optional)
	   @param  options  (object) additional settings (optional)
	   @return  (object) the configured options object */
	scatter: function(values, labels, colours, options) {
		if (!$.isArray(labels)) {
			options = labels;
			colours = null;
			labels = null;
		}
		var series = [[], [], []];
		for (var i = 0; i < values.length; i++) {
			series[0][i] = values[i][0];
			series[1][i] = values[i][1];
			series[2][i] = values[i][2] || 100;
		}
		options = options || {};
		if (labels) {
			options.extension = {chdl: labels.join('|')};
		}
		if (colours) {
			colours = $.map(colours, function(v, i) {
				return $.gchart.color(v);
			});
			$.extend(options.extension, {chco: colours.join('|')});
		}
		return $.extend({}, options,
			{type: 'scatter', series: [$.gchart.series(series[0]),
				$.gchart.series(series[1]), $.gchart.series(series[2])]});
	},

	/* Prepare options for a Venn diagram.
	   @param  size1       (number) the relative size of the first circle
	   @param  size2       (number) the relative size of the second circle
	   @param  size3       (number) the relative size of the third circle
	   @param  overlap12   (number) the overlap between circles 1 and 2
	   @param  overlap13   (number) the overlap between circles 1 and 3
	   @param  overlap23   (number) the overlap between circles 2 and 3
	   @param  overlap123  (number) the overlap between all circles
	   @param  options     (object) additional settings (optional)
	   @return  (object) the configured options object */
	venn: function(size1, size2, size3, overlap12, overlap13, overlap23, overlap123, options) {
		return $.extend({}, options || {}, {type: 'venn', series:
			[$.gchart.series([size1, size2, size3, overlap12, overlap13, overlap23, overlap123])]});
	},

	/* Prepare options for a Google meter.
	   @param  text      (string or string[]) the text to show on the arrow (optional)
	   @param  values    (number or number[] or [] of these) the position(s) of the arrow(s)
	   @param  maxValue  (number) the maximum value for the meter (optional, default 100)
	   @param  colours   (string[]) the colours to use for the band (optional)
	   @param  labels    (string[]) labels appearing beneath the meter (optional)
	   @param  styles    (number[][4]) the styles of each series' arrows:
	                     width, dash, space, arrow size (optional)
	   @param  options   (object) additional settings (optional)
	   @return  (object) the configured options object */
	meter: function(text, values, maxValue, colours, labels, styles, options) {
		if (typeof text != 'string' && !$.isArray(text)) {
			options = styles;
			styles = labels;
			labels = colours;
			colours = maxValue;
			maxValue = values;
			values = text;
			text = '';
		}
		if (typeof maxValue != 'number') {
			options = styles;
			styles = labels;
			labels = colours;
			colours = maxValue;
			maxValue = null;
		}
		if (!$.isArray(colours)) {
			options = styles;
			styles = labels;
			labels = colours;
			colours = null;
		}
		if (!$.isArray(labels)) {
			options = styles;
			styles = labels;
			labels = null;
		}
		if (!$.isArray(styles)) {
			options = styles;
			styles = null;
		}
		values = ($.isArray(values) ? values : [values]);
		var multi = false;
		for (var i = 0; i < values.length; i++) {
			multi = multi || $.isArray(values[i]);
		}
		var ss = (multi ? [] : [$.gchart.series(values)]);
		if (multi) {
			for (var i = 0; i < values.length; i++) {
				ss.push($.gchart.series($.isArray(values[i]) ? values[i] : [values[i]]));
			}
		}
		values = ss;
		if (colours) {
			var cs = '';
			$.each(colours, function(i, v) {
				cs += ',' + $.gchart.color(v);
			});
			colours = cs.substr(1);
		}
		if (styles) {
			var ls = ['', ''];
			$.each(styles, function(i, v) {
				v = ($.isArray(v) ? v : [v]);
				ls[0] += '|' + $.gchart.color(v.slice(0, 3).join(','));
				ls[1] += '|' + (v[3] || 15);
			});
			styles = ls[0].substr(1) + ls[1];
		}
		var axis = (labels && labels.length ?  $.gchart.axis('y', labels) : null);
		return $.extend({}, options || {}, {type: 'meter',
			maxValue: maxValue || 100, series: values,
			dataLabels: ($.isArray(text) ? text : [text || ''])},
			(colours ? {extension: {chco: colours}} : {}),
			(axis ? {axes: [axis]} : {}),
			(styles ? {extension: {chls: styles}} : {}));
	},

	/* Prepare options for a map chart.
	   @param  mapArea        (string) the region of the world to show (optional)
	   @param  values         (object) the countries/states to plot -
	                          attributes are country/state codes and values
	   @param  defaultColour  (string) the colour for regions without values (optional)
	   @param  colour         (string or string[]) the starting colour or
	                          gradient colours for rendering values (optional)
	   @param  endColour      (string) the ending colour for rendering values (optional)
	   @param  options        (object) additional settings (optional)
	   @return  (object) the configured options object */
	map: function(mapArea, values, defaultColour, colour, endColour, options) {
		if (typeof mapArea == 'object') { // Optional mapArea
			options = endColour;
			endColour = colour;
			colour = defaultColour;
			defaultColour = values;
			values = mapArea;
			mapArea = 'world';
		}
		if (typeof defaultColour == 'object') {
			options = defaultColour;
			endColour = null;
			colour = null;
			defaultColour = null;
		}
		else if (typeof colour == 'object' && !$.isArray(colour)) {
			options = colour;
			endColour = null;
			colour = null;
		}
		else if (typeof endColour == 'object') {
			options = endColour;
			endColour = null;
		}
		var mapRegions = [];
		var data = [];
		var i = 0;
		for (var name in values) {
			mapRegions[i] = name;
			data[i] = values[name];
			i++;
		}
		return $.extend({}, options || {}, {type: 'map',
			mapArea: mapArea, mapRegions: mapRegions,
			mapDefaultColor: defaultColour || $.gchart._defaults.mapDefaultColor,
			mapColors: ($.isArray(colour) ? colour : [colour || $.gchart._defaults.mapColors[0],
			endColour || $.gchart._defaults.mapColors[1]]),
			series: [$.gchart.series('', data)]});
	},

	/* Prepare options for generating a QR Code.
	   @param  text      (object) the QR code settings or
	                     (string) the text to encode
	   @param  encoding  (string) the encoding scheme (optional)
	   @param  ecLevel   (string) the error correction level: l, m, q, h (optional)
	   @param  margin    (number) the margin around the code (optional)
	   @return  (object) the configured options object */
	qrCode: function(text, encoding, ecLevel, margin) {
		var options = {};
		if (typeof text == 'object') {
			options = text;
		}
		else { // Individual fields
			options = {dataLabels: [text], encoding: encoding,
				qrECLevel: ecLevel, qrMargin: margin};
		}
		options.type = 'qrCode';
		if (options.text) {
			options.dataLabels = [options.text];
			options.text = null;
		}
		return options;
	},

	/* Generate a Google chart color.
	   @param  r  (string) colour name or '#hhhhhh' or
	              (number) red value (0-255)
	   @param  g  (number) green value (0-255) or
	              (number) alpha value (0-255, optional) if r is name
	   @param  b  (number) blue value (0-255)
	   @param  a  (number) alpha value (0-255, optional)
	   @return  (string) the translated colour */
	color: function(r, g, b, a) {
		var checkRange = function(value) {
			if (typeof value == 'number' && (value < 0 || value > 255)) {
				throw 'Value out of range (0-255) ' + value;
			}
		};
		var twoDigits = function(value) {
			return (value.length == 1 ? '0' : '') + value;
		};
		if (typeof r == 'string') {
			checkRange(g);
			return (r.match(/^#([A-Fa-f0-9]{2}){3,4}$/) ? r.substring(1) :
				(COLOURS[r] || r) + (g ? twoDigits(g.toString(16)) : ''));
		}
		checkRange(r);
		checkRange(g);
		checkRange(b);
		checkRange(a);
		return twoDigits(r.toString(16)) + twoDigits(g.toString(16)) +
			twoDigits(b.toString(16)) + (a ? twoDigits(a.toString(16)) : '');
	},

	/* Create a simple linear gradient definition for a background.
	   @param  angle    (string or number) the angle of the gradient from positive x-axis
	   @param  colour1  (string[]) an array of colours or
	                    (string) the starting colour
	   @param  colour2  (string, optional) the ending colour
	   @return  (object) the gradient definition */
	gradient: function(angle, colour1, colour2) {
		var colourPoints = [];
		if ($.isArray(colour1)) {
			var step = 1 / (colour1.length - 1);
			for (var i = 0; i < colour1.length; i++) {
				colourPoints.push([colour1[i], Math.round(i * step * 100) / 100]);
			}
		}
		else {
			colourPoints = [[colour1, 0], [colour2, 1]];
		}
		return {angle: angle, colorPoints: colourPoints};
	},

	/* Create a colour striping definition for a background.
	   @param  angle    (string or number) the angle of the stripes from positive x-axis
	   @param  colours  (string[]) the colours to stripe
	   @return  (object) the stripe definition */
	stripe: function(angle, colours) {
		var colourPoints = [];
		var width = Math.round(100 / colours.length) / 100;
		for (var i = 0; i < colours.length; i++) {
			colourPoints.push([colours[i], width]);
		}
		return {angle: angle, striped: true, colorPoints: colourPoints};
	},

	/* Create a range definition.
	   @param  vertical  (boolean, optional) true if vertical, false if horizontal
	   @param  colour    (string) the marker's colour
	   @param  start     (number) the starting point for the range (0.0 to 1.0)
	   @param  end       (number, optional) the ending point for the range (0.0 to 1.0)
	   @return  (object) the range definition */
	range: function(vertical, colour, start, end) {
		if (typeof vertical == 'string') { // Optional vertical
			end = start;
			start = colour;
			colour = vertical;
			vertical = false;
		}
		return {vertical: vertical, color: colour, start: start, end: end};
	},

	/* Create a marker definition.
	   @param  shape       (string) the marker shape
	   @param  colour      (string) the marker's colour
	   @param  series      (number) the series to which the marker applies
	   @param  item        (number or string or number[2 or 3], optional)
	                       the item in the series to which it applies or 'all' or
	                       'everyn' or 'everyn[s:e]' or [start, end, every]
	   @param  size        (number, optional) the size (pixels) of the marker or
	                       (string) 'thickness:length' for horizline or vertical
	   @param  priority    (string or number, optional) the rendering priority
	   @param  text        (string, optional) the display text for a text type marker
	   @param  positioned  (boolean, optional) true to absolutely position the marker
	   @param  placement   (string or string[], optional) placement locations
	   @param  offsets     (number[2], optional) pixel offsets, horizontal and vertical
	   @return  (object) the marker definition */
	marker: function(shape, colour, series, item, size, priority, text,
			positioned, placement, offsets) {
		if (typeof size == 'boolean') {
			offsets = text;
			placement = priority;
			positioned = size;
			text = null;
			priority = null;
			size = null;
		}
		if ($.isArray(size)) {
			if (typeof size[0] == 'string') {
				offsets = priority;
				placement = size;
			}
			else {
				offsets = size;
				placement = null;
			}
			positioned = null;
			text = null;
			priority = null;
			size = null;
		}
		if (typeof priority == 'boolean') {
			offsets = positioned;
			placement = text;
			positioned = priority;
			text = null;
			priority = null;
		}
		if ($.isArray(priority)) {
			if (typeof priority[0] == 'string') {
				offsets = text;
				placement = priority;
			}
			else {
				offsets = priority;
				placement = null;
			}
			positioned = null;
			text = null;
			priority = null;
		}
		if (typeof text == 'boolean') {
			offsets = placement;
			placement = positioned;
			positioned = text;
			text = null;
		}
		if ($.isArray(text)) {
			if (typeof text[0] == 'string') {
				offsets = positioned;
				placement = text;
			}
			else {
				offsets = text;
				placement = null;
			}
			positioned = null;
			text = null;
		}
		if ($.isArray(positioned)) {
			if (typeof positioned[0] == 'string') {
				offsets = placement;
				placement = positioned;
			}
			else {
				offsets = positioned;
				placement = null;
			}
			positioned = null;
		}
		if ($.isArray(placement) && typeof placement[0] != 'string') {
			offsets = placement;
			placement = null;
		}
		return {shape: shape, color: colour, series: series,
			item: (item || item == 0 ? item : -1), size: size || 10,
			priority: (priority != null ? priority : 0), text: text,
			positioned: positioned, placement: placement, offsets: offsets};
	},

	/* Create a dynamic icon definition.
	   @param  name      (string) the name of the icon to use
	   @param  data      (string) the icon's encoded parameters
	   @param  series    (number, optional) the series to which the icon applies
	   @param  item      (number or string or number[2 or 3], optional)
	                     the item in the series to which it applies or 'all' (default)
	                     or 'everyn' or [start, end, every]
	   @param  zIndex    (number, optional) the z-index (-1.0 to 1.0)
	   @param  position  (number[2], optional) an absolute chart position (0.0 to 1.0)
	   @param  offsets   (number[2], optional) pixel offsets
	   @return  (object) the icon definition */
	icon: function(name, data, series, item, zIndex, position, offsets) {
		if ($.isArray(series)) {
			offsets = item;
			position = series;
			zIndex = null;
			item = null;
			series = null;
		}
		if ($.isArray(zIndex)) {
			offsets = position;
			position = zIndex;
			zIndex = null;
		}
		return {name: name, data: data, series: series || 0, item: (item || item == 0 ? item : 'all'),
			zIndex: zIndex, position: position, offsets: offsets};
	},

	/* Create a number format for a marker.
	   @param  type        (object) containing all these settings or
	                       (string) 'f' for floating point, 'p' for percentage,
	                       'e' for scientific notation, 'c<CUR>' for currency (as specified by CUR)
	   @param  prefix      (string, optional) text appearing before the number
	   @param  suffix      (string, optional - can only be present if prefix is present)
	                       text appearing after the number
	   @param  precision   (number, optional) the number of decimal places
	   @param  showX       (boolean, optional) true to show the x-value, false for the y-value
	   @param  zeroes      (boolean, optional - can only be present if showX is present)
	                       true to display trailing zeroes
	   @param  separators  (boolean, optional - can only be present if showX and zeroes are present)
	                       true to display group separators
	   @return  (string) the format definition */
	numberFormat: function(type, prefix, suffix, precision, showX, zeroes, separators) {
		var format = initNumberFormat(type, prefix, suffix, precision, showX, zeroes, separators);
		return format.prefix + '*' + format.type + format.precision + (format.zeroes ? 'z' : '') +
			(format.separators ? 's' : '') + (format.showX ? 'x' : '') + '*' + format.suffix;
	},

	/* Create an axis definition.
	   @param  axis           (string) the axis position: top, bottom, left, right
	   @param  labels         (string[]) the labels for this axis
	   @param  positions      (number[], optional) the positions of the labels
	   @param  rangeStart     (number, optional with next two) start of range
	   @param  rangeEnd       (number, optional with above) end of range
	   @param  rangeInterval  (number, optional with above) interval between values in the range
	   @param  colour         (string, optional) the axis colour
	   @param  alignment      (string, optional) the labels' alignment
	   @param  size           (number, optional) the labels' size
	   @param  format         (object, optional) the labels' number format options
	   @return  (object) the axis definition */
	axis: function(axis, labels, positions, rangeStart,
			rangeEnd, rangeInterval, colour, alignment, size, format) {
		return new GChartAxis(axis, labels, positions, rangeStart,
			rangeEnd, rangeInterval, colour, alignment, size, format);
	},
	
	/* Determine the region within a chart.
	   @param  event     (MouseEvent) the mouse event contining the cursor position
	   @param  jsonData  (object) the JSON description of the chart
	   @return  (object) the current region details (type, series, and point) or null if none */
	findRegion: function(event, jsonData) {
		if (!jsonData || !jsonData.chartshape) {
			return null;
		}
		var decodeName = function(name) {
			var matches = name.match(/([^\d]+)(\d+)(?:_(\d)+)?/);
			return {type: matches[1], series: parseInt(matches[2]), point: parseInt(matches[3] || -1)};
		};
		var offset = $(event.target).offset();
		var x = event.pageX - offset.left;
		var y = event.pageY - offset.top;
		for (var i = 0; i < jsonData.chartshape.length; i++) {
			var shape = jsonData.chartshape[i];
			switch (shape.type) {
				case 'RECT':
					if (shape.coords[0] <= x && x <= shape.coords[2] &&
							shape.coords[1] <= y && y <= shape.coords[3]) {
						return decodeName(shape.name);
					}
					break;
				case 'POLY':
					if ($.gchart._insidePolygon(shape.coords, x, y)) {
						return decodeName(shape.name);
					}
					break;
			}
		}
		return null;
	},

	/* Determine whether a point is within a polygon.
	   Ray casting algorithm adapted from http://ozviz.wasp.uwa.edu.au/~pbourke/geometry/insidepoly/.
	   @param  coords  (number[]) the polygon coords as [x1, y1, x2, y2, ...]
	   @param  x       (number) the point's x-coord
	   @param  y       (number) the point's y-coord
	   @return  (boolean) true if the point is inside, false if not */
	_insidePolygon: function(coords, x, y) {
		var counter = 0;
		var p1 = [coords[0], coords[1]];
		for (var i = 2; i <= coords.length; i += 2) {
			var p2 = [coords[i % coords.length], coords[i % coords.length + 1]];
			if (y > Math.min(p1[1], p2[1]) && y <= Math.max(p1[1], p2[1])) {
				if (x <= Math.max(p1[0], p2[0]) && p1[1] != p2[1]) {
					var xinters = (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]) + p1[0];
					if (p1[0] == p2[0] || x <= xinters) {
						counter++;
					}
				}
			}
			p1 = p2;
		}
		return (counter % 2 != 0);
	},

	/* Attach the Google chart functionality to a div.
	   @param  target   (element) the containing division
	   @param  options  (object) the settings for this Google chart instance (optional) */
	_attachGChart: function(target, options) {
		target = $(target);
		if (target.is('.' + this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		options = options || {};
		var width = options.width || parseInt(target.css('width'), 10);
		var height = options.height || parseInt(target.css('height'), 10);
		var allOptions = $.extend({}, this._defaults, options,
			{width: width, height: height});
		$.data(target[0], PROP_NAME, allOptions);
		this._updateChart(target[0], allOptions);
	},

	/* Reconfigure the settings for a Google charting div.
	   @param  target   (element) the containing division
	   @param  name     (object) the new settings for this Google chart instance or
	                    (string) the name of a single option
	   @param  value    (any, optional) the option's value */
	_changeGChart: function(target, name, value) {
		var options = name || {};
		if (typeof name == 'string') {
			options = {};
			options[name] = value;
		}
		var curOptions = $.data(target, PROP_NAME);
		extendRemove(curOptions || {}, options);
		$.data(target, PROP_NAME, curOptions);
		this._updateChart(target, curOptions);
	},

	/* Remove the Google charting functionality from a div.
	   @param  target  (element) the containing division */
	_destroyGChart: function(target) {
		target = $(target);
		if (!target.is('.' + this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty();
		$.removeData(target[0], PROP_NAME);
	},

	/* Generate the Google charting request with the new settings.
	   @param  options  (object) the new settings for this Google chart instance
	   @return  (string) the Google chart URL */
	_generateChart: function(options) {
		var type = CHART_TYPES[options.type] || 'p3';
		var encoding = this['_' + options.encoding + 'Encoding'] ||
			this['_textEncoding'];
		var labels = '';
		for (var i = 0; i < options.dataLabels.length; i++) {
			labels += '|' + encodeURIComponent(options.dataLabels[i] || '');
		}
		labels = (labels.length == options.dataLabels.length ? '' : labels);
		var legends = '';
		var colours = '';
		var hasColour = false;
		var lines = '';
		for (var i = 0; i < options.series.length; i++) {
			legends += '|' + encodeURIComponent(options.series[i].label || '');
			var clrs = '';
			if (type != 'lxy' || i % 2 == 0) {
				var sep = ',';
				$.each(($.isArray(options.series[i].color) ? options.series[i].color :
						[options.series[i].color]), function(i, v) {
					var colour = $.gchart.color(v || '');
					if (colour) {
						hasColour = true;
					}
					clrs += sep + (colour || '000000');
					sep = '|';
				});
			}
			colours += (hasColour ? clrs : '');
			if (type.substr(0, 1) == 'l' && options.series[i].lineThickness &&
					$.isArray(options.series[i].lineSegments)) {
				lines += '|' + options.series[i].lineThickness + ',' +
					options.series[i].lineSegments.join(',');
			}
		}
		var include = function(name, value) {
			return (value ? name + value : '');
		};
		var addSize = function() {
			options.width = Math.max(10, Math.min(options.width, 1000));
			options.height = Math.max(10, Math.min(options.height, 1000));
			if (type != 't' && options.width * options.height > 300000) {
				options.height = Math.floor(300000 / options.width);
			}
			return (type != 't' ? '&chs=' + options.width + 'x' + options.height :
				'&chs=' + Math.min(440, options.width) + 'x' + Math.min(220, options.height));
		};
		var addMargins = function() {
			var margins = options.margins;
			margins = (margins == null ? null :
				(typeof margins == 'number' ? [margins, margins, margins, margins] :
				(!$.isArray(margins) ? null :
				(margins.length == 4 ? margins :
				(margins.length == 2 ? [margins[0], margins[0], margins[1], margins[1]] : null)))));
			return (!margins ? '' : '&chma=' + margins.join(',') +
				(!options.legendSize || options.legendSize.length != 2 ? '' :
				'|' + options.legendSize.join(',')));
		};
		var qrOptions = function() {
			return include('&choe=', options.encoding) +
				(options.qrECLevel || options.qrMargin ?
				'&chld=' + (options.qrECLevel ? options.qrECLevel.charAt(0) : 'l') +
				(options.qrMargin != null ? '|' + options.qrMargin : '') : '') +
				(labels ? '&chl=' + labels.substr(1) : '');
		};
		var mapOptions = function() {
			var colours = '';
			for (var i = 0; i < options.mapColors.length; i++) {
				colours += ',' + $.gchart.color(options.mapColors[i]);
			}
			return '&chtm=' + (options.mapArea || 'world') +
				'&chd=' + encoding.apply($.gchart, [options]) +
				(options.mapRegions && options.mapRegions.length ?
				'&chld=' + options.mapRegions.join('') : '') +
				'&chco=' + $.gchart.color(options.mapDefaultColor) + colours;
		};
		var pieOptions = function() {
			return (options.pieOrientation ?
				'&chp=' + (options.pieOrientation / 180 * Math.PI) : '') +
				standardOptions();
		};
		var standardOptions = function() {
			return '&chd=' + encoding.apply($.gchart, [options]) +
				(labels ? '&chl=' + labels.substr(1) : '');
		};
		var addBarSizings = function() {
			return (type.substr(0, 1) != 'b' ? '' : (options.barWidth == null ? '' :
				'&chbh=' + options.barWidth +
				(options.barSpacing == null ? '' : ',' + (options.barWidth == $.gchart.barWidthRelative ?
				Math.min(Math.max(options.barSpacing, 0.0), 1.0) : options.barSpacing) +
				(options.barGroupSpacing == null ? '' : ',' + (options.barWidth == $.gchart.barWidthRelative ?
				Math.min(Math.max(options.barGroupSpacing, 0.0), 1.0) : options.barGroupSpacing)))) +
				(options.barZeroPoint == null ? '' : '&chp=' + options.barZeroPoint));
		};
		var addLineStyles = function() {
			return (type.charAt(0) == 'l' && lines ? '&chls=' + lines.substr(1) : '');
		};
		var addColours = function() {
			return (colours.length > options.series.length ? '&chco=' + colours.substr(1) : '');
		};
		var addTitle = function() {
			return include('&chtt=', encodeURIComponent(options.title)) +
			(options.titleColor || options.titleSize ?
			'&chts=' + ($.gchart.color(options.titleColor) || '000000') + ',' +
			(options.titleSize || 20) : '');
		};
		var addBackground = function(area, background) {
			if (background == null) {
				return '';
			}
			if (typeof background == 'string') {
				return area + ',s,' + $.gchart.color(background);
			}
			var bg = area + ',l' + (background.striped ? 's' : 'g') + ',' +
				(GRADIENTS[background.angle] != null ?
				GRADIENTS[background.angle] : background.angle);
			for (var i = 0; i < background.colorPoints.length; i++) {
				bg += ',' + $.gchart.color(background.colorPoints[i][0]) +
					',' + background.colorPoints[i][1];
			}
			return bg;
		};
		var addBackgrounds = function() {
			var opacity = (!options.opacity ? null : '000000' +
				Math.floor(options.opacity / (options.opacity > 1 ? 100 : 1) * 255).toString(16));
			if (opacity && opacity.length < 8) {
				opacity = '0' + opacity;
			}
			var backgrounds = addBackground('|a', opacity) +
				addBackground('|bg', options.backgroundColor) +
				addBackground('|c', options.chartColor);
			return (backgrounds ? '&chf=' + backgrounds.substr(1) : '');
		};
		var addGrids = function() {
			return (options.gridSize.length == 0 ? '' :
				'&chg=' + options.gridSize[0] + ',' + options.gridSize[1] +
				(options.gridLine.length == 0 ? '' :
				',' + options.gridLine[0] + ',' + options.gridLine[1] +
				(options.gridOffsets.length == 0 ? '' :
				',' + options.gridOffsets[0] + ',' + options.gridOffsets[1])));
		};
		var addLegends = function() {
			var order = (options.legendOrder && options.legendOrder.match(/^\d+(,\d+)*$/) ?
				options.legendOrder : ORDERS[options.legendOrder]) || '';
			return (!options.legend || legends.length <= options.series.length ? '' :
				'&chdl=' + legends.substr(1) + include('&chdlp=',
				options.legend.charAt(0) + (options.legend.indexOf('V') > -1 ? 'v' : '') +
				include('|', order)));
		};
		var addExtensions = function() {
			var params = '';
			for (var name in options.extension) {
				params += '&' + name + '=' + options.extension[name];
			}
			return params;
		};
		var format = options.format || 'png';
		return 'http://chart.apis.google.com/chart?' +
			(format != 'png' ? 'chof=' + format + '&' : '') +
			'cht=' + type + addSize() + addMargins() +
			(type == 'qr' ? qrOptions() : (type == 't' ? mapOptions() :
			(type.charAt(0) == 'p' ? pieOptions() : standardOptions()))) +
			addBarSizings() + addLineStyles() + addColours() + addTitle() +
			this._addAxes(options) + addBackgrounds() + addGrids() +
			this._addMarkers(options) + this._addIcons(options) + addLegends() + addExtensions();
	},

	/* Generate axes parameters.
	   @param  options  (object) the current instance settings
	   @return  (string) the axes parameters */
	_addAxes: function(options) {
		var axes = '';
		var axesLabels = '';
		var axesPositions = '';
		var axesRanges = '';
		var axesStyles = '';
		var axesTicks = '';
		for (var i = 0; i < options.axes.length; i++) {
			var axisDef = (typeof options.axes[i] == 'string' ?
				new GChartAxis(options.axes[i]) : options.axes[i]);
			var axis = axisDef.axis().charAt(0);
			axes += ',' + (axis == 'b' ? 'x' : (axis == 'l' ? 'y' : axis));
			if (axisDef.labels()) {
				var labels = '';
				for (var j = 0; j < axisDef.labels().length; j++) {
					labels += '|' + encodeURIComponent(axisDef.labels()[j] || '');
				}
				axesLabels += (labels ? '|' + i + ':' + labels : '');
			}
			if (axisDef.positions()) {
				var positions = '';
				for (var j = 0; j < axisDef.positions().length; j++) {
					positions += ',' + axisDef.positions()[j];
				}
				axesPositions += (positions ? '|' + i + positions : '');
			}
			if (axisDef.range()) {
				var range = axisDef.range();
				axesRanges += '|' + i + ',' + range[0] + ',' + range[1] +
					(range[2] ? ',' + range[2] : '');
			}
			if (axisDef.style() || axisDef.drawing() || axisDef.ticks() || axisDef.format()) {
				var style = axisDef.style() || {};
				var ticks = axisDef.ticks() || {};
				axesStyles += '|' + i +
					(axisDef.format() ? 'N' + this.numberFormat(axisDef.format()) : '') + ',' +
					$.gchart.color(style.color || 'gray') + ',' +
					(style.size || 10) + ',' + 
					(ALIGNMENTS[style.alignment] || style.alignment || 0) +
					(!axisDef.drawing() && !ticks.color ? '' : ',' +
					(DRAWING[axisDef.drawing()] || axisDef.drawing() || 'lt') +
					(ticks.color ? ',' + $.gchart.color(ticks.color) : ''));
			}
			if (axisDef.ticks() && axisDef.ticks().length) {
				axesTicks += '|' + i + ',' + axisDef.ticks().length;
			}
		}
		return (!axes ? '' : '&chxt=' + axes.substr(1) +
			(!axesLabels ? '' : '&chxl=' + axesLabels.substr(1)) +
			(!axesPositions ? '' : '&chxp=' + axesPositions.substr(1)) +
			(!axesRanges ? '' : '&chxr=' + axesRanges.substr(1)) +
			(!axesStyles ? '' : '&chxs=' + axesStyles.substr(1)) +
			(!axesTicks ? '' : '&chxtc=' + axesTicks.substr(1)));
	},

	/* Generate markers parameters.
	   @param  options  (object) the current instance settings
	   @return  (string) the markers parameters */
	_addMarkers: function(options) {
		var markers = '';
		var decodeItem = function(item, positioned) {
			if (item == 'all') {
				return -1;
			}
			if (typeof item == 'string') {
				var matches = /^every(\d+)(?:\[(\d+):(\d+)\])?$/.exec(item);
				if (matches) {
					var every = parseInt(matches[1], 10);
					return (matches[2] && matches[3] ?
						(positioned ? Math.max(0.0, Math.min(1.0, matches[2])) : matches[2]) + ':' +
						(positioned ? Math.max(0.0, Math.min(1.0, matches[3])) : matches[3]) + ':' +
						every : -every);
				}
			}
			if ($.isArray(item)) {
				item = $.map(item, function(v, i) {
					return (positioned ? Math.max(0.0, Math.min(1.0, v)) : v);
				});
				return item.join(':') + (item.length < 2 ? ':' : '');
			}
			return item;
		};
		var escapeText = function(value) {
			return value.replace(/,/g, '\\,');
		};
		for (var i = 0; i < options.markers.length; i++) {
			var marker = options.markers[i];
			var shape = SHAPES[marker.shape] || marker.shape;
			var placement = '';
			if (marker.placement) {
				var placements = $.makeArray(marker.placement);
				for (var j = 0; j < placements.length; j++) {
					placement += PLACEMENTS[placements[j]] || '';
				}
			}
			markers += '|' + (marker.positioned ? '@' : '') + shape +
				('AfNt'.indexOf(shape) > -1 ? escapeText(marker.text || '') : '') + ',' +
				$.gchart.color(marker.color) + ',' +
				marker.series + ',' + decodeItem(marker.item, marker.positioned) +
				',' + marker.size + ',' + (PRIORITIES[marker.priority] != null ?
				PRIORITIES[marker.priority] : marker.priority) +
				(placement || marker.offsets ? ',' + placement +
				':' + (marker.offsets && marker.offsets[0] ? marker.offsets[0] : '') +
				':' + (marker.offsets && marker.offsets[1] ? marker.offsets[1] : '') : '');
		}
		for (var i = 0; i < options.ranges.length; i++) {
			markers += '|' + (options.ranges[i].vertical ? 'R' : 'r') + ',' +
				$.gchart.color(options.ranges[i].color) + ',0,' +
				options.ranges[i].start + ',' +
				(options.ranges[i].end || options.ranges[i].start + 0.005);
		}
		for (var i = 0; i < options.series.length; i++) {
			if (options.series[i].fillColor) {
				var fills = ($.isArray(options.series[i].fillColor) ?
					options.series[i].fillColor : [options.series[i].fillColor]);
				for (var j = 0; j < fills.length; j++) {
					if (typeof fills[j] == 'string') {
						markers += '|b,' + $.gchart.color(options.series[i].fillColor) +
							',' + i + ',' + (i + 1) + ',0';
					}
					else {
						var props = ($.isArray(fills[j]) ? fills[j] : [fills[j].color, fills[j].range]);
						markers += '|B,' + $.gchart.color(props[0]) +
							',' + i + ',' + props[1] + ',0';
					}
				}
			}
		}
		return (markers ? '&chm=' + markers.substr(1) : '');
	},

	/* Generate dynamic icon parameters.
	   @param  options  (object) the current instance settings
	   @return  (string) the icons parameters */
	_addIcons: function(options) {
		var icons = '';
		var decodeItem = function(item) {
			if (item == 'all') {
				return item;
			}
			if (typeof item == 'string') {
				if (/^every(\d+)$/.exec(item)) {
					return item.replace(/every/, 'every,');
				}
			}
			if ($.isArray(item)) {
				return 'range,' + item.join(',');
			}
			return item;
		};
		for (var i = 0; i < options.icons.length; i++) {
			var icon = options.icons[i];
			icons += '|y;s=' + icon.name + ';d=' + icon.data +
				(icon.position ? '' : ';ds=' + icon.series + ';dp=' + decodeItem(icon.item)) +
				(icon.zIndex ? ';py=' + icon.zIndex : '') + 
				(icon.position ? ';po=' + icon.position.join(',') : '') + 
				(icon.offsets ? ';of=' + icon.offsets.join(',') : '');
		}
		return (icons ? '&chem=' + icons.substr(1) : '');
	},

	/* Update the Google charting div with the new settings.
	   @param  target   (element) the containing division
	   @param  options  (object) the new settings for this Google chart instance */
	_updateChart: function(target, options) {
		options._src = this._generateChart(options);
		if (options.usePost) {
			var form = '<form action="http://chart.apis.google.com/chart?' +
				Math.floor(Math.random() * 1e8) + '" method="POST">';
			var pattern = /(\w+)=([^&]*)/g;
			var match = pattern.exec(options._src);
			while (match) {
				form += '<input type="hidden" name="' + match[1] + '" value="' +
					($.inArray(match[1], ['chdl', 'chl', 'chtt', 'chxl']) > -1 ?
					decodeURIComponent(match[2]) : match[2]) + '">';
				match = pattern.exec(options._src);
			}
			form += '</form>';
			target = $(target);
			target.empty();
			var ifr = $('<iframe></iframe>').appendTo(target).css({width: '100%', height: '100%'});
			var doc = ifr.contents()[0]; // Write iframe directly
			doc.open();
			doc.write(form);
			doc.close();
			ifr.show().contents().find('form').submit();	
		}
		else {
			var img = $(new Image()); // Prepare to load chart image in background
			img.load(function() { // Once loaded...
				$(target).find('img').remove().end().append(this); // Replace
				if (options.onLoad) {
					if (options.provideJSON) { // Retrieve JSON details
						$.getJSON(options._src + '&chof=json&callback=?', 
							function(data) {
								options.onLoad.apply(target, [$.gchart._normaliseRects(data)]);
							});
					}
					else {
						options.onLoad.apply(target, []);
					}
				}
			});
			$(img).attr('src', options._src);
		}
	},

	/* Ensure that rectangle coords go from min to max.
	   @param  jsonData  (object) the JSON description of the chart
	   @return  (object) the normalised JSON description */
	_normaliseRects: function(jsonData) {
		if (jsonData && jsonData.chartshape) {
			for (var i = 0; i < jsonData.chartshape.length; i++) {
				var shape = jsonData.chartshape[i];
				if (shape.type == 'RECT') {
					if (shape.coords[0] > shape.coords[2]) {
						var temp = shape.coords[0];
						shape.coords[0] = shape.coords[2];
						shape.coords[2] = temp;
					}
					if (shape.coords[1] > shape.coords[3]) {
						var temp = shape.coords[1];
						shape.coords[1] = shape.coords[3];
						shape.coords[3] = temp;
					}
				}
			}
		}
		return jsonData;
	},

	/* Encode all series with text encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_textEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		for (var i = 0; i < options.series.length; i++) {
			data += '|' + this._textEncode(options.series[i], minValue, maxValue);
		}
		return 't' + (options.visibleSeries || '') + ':' + data.substr(1);
	},

	/* Encode values in text format: numeric 0.0 to 100.0, comma separated, -1 for null
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @param  maxValue  (number) the maximum possible data value
	   @return  (string) the encoded data values */
	_textEncode: function(series, minValue, maxValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		maxValue = (series.maxValue != null ? series.maxValue : maxValue);
		var factor = 100 / (maxValue - minValue);
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += ',' + (series.data[i] == null || isNaN(series.data[i]) ? '-1' :
				Math.round(factor * (series.data[i] - minValue) * 100) / 100);
		}
		return data.substr(1);
	},

	/* Encode all series with scaled text encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_scaledEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		var minMax = '';
		for (var i = 0; i < options.series.length; i++) {
			data += '|' + this._scaledEncode(options.series[i], minValue);
			minMax += ',' + (options.series[i].minValue != null ?
				options.series[i].minValue : minValue) +
				',' + (options.series[i].maxValue != null ?
				options.series[i].maxValue : maxValue);
		}
		return 't' + (options.visibleSeries || '') + ':' + data.substr(1) +
			'&chds=' + minMax.substr(1);
	},

	/* Encode values in text format: numeric min to max, comma separated, min - 1 for null
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @return  (string) the encoded data values */
	_scaledEncode: function(series, minValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += ',' + (series.data[i] == null || isNaN(series.data[i]) ?
				(minValue - 1) : series.data[i]);
		}
		return data.substr(1);
	},

	/* Encode all series with simple encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_simpleEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		for (var i = 0; i < options.series.length; i++) {
			data += ',' + this._simpleEncode(options.series[i], minValue, maxValue);
		}
		return 's' + (options.visibleSeries || '') + ':' + data.substr(1);
	},

	/* Encode values in simple format: single character,
	   banded-62 as A-Za-z0-9, _ for null.
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @param  maxValue  (number) the maximum possible data value
	   @return  (string) the encoded data values */
	_simpleEncode: function(series, minValue, maxValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		maxValue = (series.maxValue != null ? series.maxValue : maxValue);
		var factor = 61 / (maxValue - minValue);
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += (series.data[i] == null || isNaN(series.data[i]) ? '_' :
				SIMPLE_ENCODING.charAt(Math.round(factor * (series.data[i] - minValue))));
		}
		return data;
	},

	/* Encode all series with extended encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_extendedEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		for (var i = 0; i < options.series.length; i++) {
			data += ',' + this._extendedEncode(options.series[i], minValue, maxValue);
		}
		return 'e' + (options.visibleSeries || '') + ':' + data.substr(1);
	},

	/* Encode values in extended format: double character,
	   banded-4096 as A-Za-z0-9-., __ for null.
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @param  maxValue  (number) the maximum possible data value
	   @return  (string) the encoded data values */
	_extendedEncode: function(series, minValue, maxValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		maxValue = (series.maxValue != null ? series.maxValue : maxValue);
		var factor = 4095 / (maxValue - minValue);
		var encode = function(value) {
			return EXTENDED_ENCODING.charAt(value / 64) +
				EXTENDED_ENCODING.charAt(value % 64);
		};
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += (series.data[i] == null || isNaN(series.data[i]) ? '__' :
				encode(Math.round(factor * (series.data[i] - minValue))));
		}
		return data;
	},

	/* Determine the minimum value amongst the data values.
	   @param  series  (object[]) the series to examine
	   @return  (number) the minimum value therein */
	_calculateMinValue: function(series) {
		var minValue = 99999999;
		for (var i = 0; i < series.length; i++) {
			var data = series[i].data;
			for (var j = 0; j < data.length; j++) {
				minValue = Math.min(minValue, (data[j] == null ? 99999999 : data[j]));
			}
		}
		return minValue;
	},

	/* Determine the maximum value amongst the data values.
	   @param  series  (object[]) the series to examine
	   @return  (number) the maximum value therein */
	_calculateMaxValue: function(series) {
		var maxValue = -99999999;
		for (var i = 0; i < series.length; i++) {
			var data = series[i].data;
			for (var j = 0; j < data.length; j++) {
				maxValue = Math.max(maxValue, (data[j] == null ? -99999999 : data[j]));
			}
		}
		return maxValue;
	}
});

/* The definition of a chart axis.
   @param  axis           (string) the axis position: top, bottom, left, right
   @param  labels         (string[]) the labels for this axis
   @param  positions      (number[], optional) the positions of the labels
   @param  rangeStart     (number, optional with next two) start of range
   @param  rangeEnd       (number, optional with above) end of range
   @param  rangeInterval  (number, optional with above) interval between values in the range
   @param  colour         (string, optional) the axis colour
   @param  alignment      (string, optional) the labels' alignment
   @param  size           (number, optional) the labels' size
   @param  format         (object, optional) the labels' number format options */
function GChartAxis(axis, labels, positions, rangeStart, rangeEnd, rangeInterval,
		colour, alignment, size, format) {
	if (typeof labels == 'number') { // Range instead of labels/positions
		format = alignment;
		size = colour;
		alignment = rangeInterval;
		colour = rangeEnd;
		rangeInterval = rangeStart;
		rangeEnd = positions;
		rangeStart = labels;
		positions = null;
		labels = null;
	}
	else if (!$.isArray(positions)) { // Optional positions
		format = size;
		size = alignment;
		alignment = colour;
		colour = rangeInterval;
		rangeInterval = rangeEnd;
		rangeEnd = rangeStart;
		rangeStart = positions;
		positions = null;
	}
	if (typeof rangeStart == 'string') { // Optional rangeStart/rangeEnd/rangeInterval
		format = colour;
		size = rangeInterval;
		alignment = rangeEnd;
		colour = rangeStart;
		rangeInterval = null;
		rangeEnd = null;
		rangeStart = null;
	}
	if (typeof rangeInterval == 'string') { // Optional rangeInterval
		format = size;
		size = alignment;
		alignment = colour;
		colour = rangeInterval;
		rangeInterval = null;
	}
	if (typeof alignment == 'number') { // Optional alignment
		format = size;
		size = alignment;
		alignment = null;
	}
	this._axis = axis;
	this._labels = labels;
	this._positions = positions;
	this._range = (rangeStart != null ? [rangeStart, rangeEnd, rangeInterval] : null);
	this._color = colour;
	this._alignment = alignment;
	this._size = size;
	this._drawing = null;
	this._tickColor = null;
	this._tickLength = null;
	this._format = format;
}

$.extend(GChartAxis.prototype, {

	/* Get/set the axis position.
	   @param  axis  (string) the axis position: top, bottom, left, right
	   @return  (GChartAxis) the axis object or
	            (string) the axis position (if no parameters specified) */
	axis: function(axis) {
		if (arguments.length == 0) {
			return this._axis;
		}
		this._axis = axis;
		return this;
	},
	
	/* Get/set the axis labels.
	   @param  labels  (string[]) the labels for this axis
	   @return  (GChartAxis) the axis object or
	            (string[]) the axis labels (if no parameters specified) */
	labels: function(labels) {
		if (arguments.length == 0) {
			return this._labels;
		}
		this._labels = labels;
		return this;
	},

	/* Get/set the axis label positions.
	   @param  positions  (number[]) the positions of the labels
	   @return  (GChartAxis) the axis object or
	            (number[]) the axis label positions (if no parameters specified) */
	positions: function(positions) {
		if (arguments.length == 0) {
			return this._positions;
		}
		this._positions = positions;
		return this;
	},

	/* Get/set the axis range.
	   @param  rangeStart     (number) start of range
	   @param  rangeEnd       (number) end of range
	   @param  rangeInterval  (number, optional) interval between values in the range
	   @return  (GChartAxis) the axis object or
	            (number[3]) the axis range start, end, and interval (if no parameters specified) */
	range: function(start, end, interval) {
		if (arguments.length == 0) {
			return this._range;
		}
		this._range = [start, end, interval];
		return this;
	},

	/* Get/set the axis style.
	   @param  colour     (string) the axis colour
	   @param  alignment  (string, optional) the labels' alignment
	   @param  size       (number, optional) the labels' size
	   @return  (GChartAxis) the axis object or
	            (object) the axis style with attributes color, alignment, and size
				(if no parameters specified) */
	style: function(colour, alignment, size) {
		if (arguments.length == 0) {
			return (!this._color && !this._alignment && !this._size ? null :
				{color: this._color, alignment: this._alignment, size: this._size});
		}
		this._color = colour;
		this._alignment = alignment;
		this._size = size;
		return this;
	},

	/* Get/set the axis drawing control.
	   @param  drawing  (string) the drawing control: line, ticks, both
	   @return  (GChartAxis) the axis object or
	            (string) the axis drawing control (if no parameters specified) */
	drawing: function(drawing) {
		if (arguments.length == 0) {
			return this._drawing;
		}
		this._drawing = drawing;
		return this;
	},

	/* Get/set the axis tick style.
	   @param  colour  (string) the colour of the tick marks
	   @param  length  (number, optional) the length of the tick marks,
	                   negative values draw inside the chart or
					   (string, optional) list of lengths, comma-separated
	   @return  (GChartAxis) the axis object or
	            (object) the axis tick style with attributes color and length
				(if no parameters specified) */
	ticks: function(colour, length) {
		if (arguments.length == 0) {
			return (!this._tickColor && !this._tickLength ? null :
				{color: this._tickColor, length: this._tickLength});
		}
		this._tickColor = colour;
		this._tickLength = length;
		return this;
	},

	/* Get/set the number format for the axis.
	   @param  type        (object) containing all these settings or
	                       (string) 'f' for floating point, 'p' for percentage,
	                       'e' for scientific notation, 'c<CUR>' for currency (as specified by CUR)
	   @param  prefix      (string, optional) text appearing before the number
	   @param  suffix      (string, optional - can only be present if prefix is present)
	                       text appearing after the number
	   @param  precision   (number, optional) the number of decimal places
	   @param  showX       (boolean, optional) true to show the x-value, false for the y-value
	   @param  zeroes      (boolean, optional - can only be present if showX is present)
	                       true to display trailing zeroes
	   @param  separators  (boolean, optional - can only be present if showX and zeroes are present)
	                       true to display group separators
	   @return  (GChartAxis) the axis object or
	            (object) the axis format (if no parameters specified) */
	format: function(type, prefix, suffix, precision, showX, zeroes, separators) {
		if (arguments.length == 0) {
			return this._format;
		}
		this._format = initNumberFormat(type, prefix, suffix, precision, showX, zeroes, separators);
		return this;
	}
});

/* Initialise a number format specification. */
function initNumberFormat(type, prefix, suffix, precision, showX, zeroes, separators) {
	if (typeof type == 'object') {
		return type;
	}
	if (typeof prefix == 'number') {
		separators = showX;
		zeroes = precision;
		showX = suffix;
		precision = prefix;
		suffix = '';
		prefix = '';
	}
	if (typeof prefix == 'boolean') {
		separators = precision;
		zeroes = suffix;
		showX = prefix;
		precision = 0;
		suffix = '';
		prefix = '';
	}
	if (typeof suffix == 'number') {
		separators = zeroes;
		zeroes = showX;
		showX = precision;
		precision = suffix;
		suffix = '';
	}
	if (typeof suffix == 'boolean') {
		separators = showX;
		zeroes = precision;
		showX = suffix;
		precision = 0;
		suffix = '';
	}
	if (typeof precision == 'boolean') {
		separators = zeroes;
		zeroes = showX;
		showX = precision;
		precision = 0;
	}
	return {type: type, prefix: prefix || '', suffix: suffix || '', precision: precision || '',
		showX: showX || false, zeroes: zeroes || false, separators: separators || false};
}

/* jQuery extend now ignores nulls!
   @param  target  (object) the object to extend
   @param  props   (object) the new attributes to add
   @return  (object) the updated object */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = null;
		}
	}
	return target;
}

/* Attach the Google chart functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these Google chart instances
   @return  (jQuery object) for chaining further calls */
$.fn.gchart = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (options == 'current') {
		return $.gchart['_' + options + 'GChart'].
			apply($.gchart, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			$.gchart['_' + options + 'GChart'].
				apply($.gchart, [this].concat(otherArgs));
		}
		else {
			$.gchart._attachGChart(this, options);
		}
	});
};

/* Initialise the Google chart functionality. */
$.gchart = new GChart(); // singleton instance

})(jQuery);
