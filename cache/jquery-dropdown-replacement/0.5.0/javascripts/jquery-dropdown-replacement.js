
/**
 * jQuery.DropdownReplacement
 * Copyright (c) 2010 Mikhail Koryak - http://notetodogself.blogspot.com
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * Date: 07/07/10
 *
 * @projectDescription Full featured dropdown replacement
 *
 * Dependancies:
 * jquery 1.4.2+ [required]
 * jquery.scrollTo 1.4.2+ [required]
 * jquery.support.windowsTheme 0.2 [optional]
 * jquery.bgiframe 1.2.1+ [optional]
 *
 * http://notetodogself.blogspot.com
 * http://programmingdrunk.com/current-projects/dropdownReplacement/
 *
 * Works with jQuery 1.4.2. Tested on FF3.6, FF3.0, IE6, IE7, IE8 on WinXP.
 *									  FF3.6 on Windows 7
 *
 * @author Mikhail Koryak
 * @version 0.5
 */

;(function($){
$.dropdownReplacement = {defaults:{ //version 0.4.6
	options: null, //can be a JSON list ex: [{"v":"val1", "t":"test"},{"v":"v2", "t":"text2"}], prebuilt options html (see demos), or null if 'this' is a select
	selectClass: null, //user defined class to give to the element that will act as the <select>
	optionsClass: "dropdownOpts", //the options body class
	optionsDisplayNum: 25, //number of options to display before making a scrollbar
	optionClass: "dropdownOpt",  //every option will have this class
	optionSelectedClass:"selectedOpt", //class to give to the selected option
	resizeSelectToFitOptions: false,//if false - the options will extend beyond the select box. this may be preferable
	useHiddenInput:true, //when selected value is changed copy it to a hidden input with same name as the original element. otherwise use onSelect function to do it yourself

	//advanced options:
	resizeOptionsToFitSelect: true, //set this to false, and if your options are 20px, and select 200px, the options will stay 20px

	selectCssWidth: null, //set width of the dropdown, pass in entire css string ex: '400px !important'
	optionsWidthOffset: 3, //magic number that you can fiddle with if the width of the options body is wrong
	debounceLookupMs: 200, //when user types in order to find the option, this is the timeout between keystrokes before doing the search
	debounceArrowsMs: 50, //timeout between arrow keydowns before firing onSelect
	lookupMaxWordLength: 3, //higher the number, more you can look up by typing at the select, more memory used/slower load time.
  //TODO: scrollWidth - if scroll bar is introduced that means height has changed, so perhaps this is not needed?
  scrollWidth: 17, //view port resize detection depends on this being correct. if it is smaller then reality, and you dropdown the options on a very small screen on ie, the options will be hidden because of a triggered window resize event which hides them.
	//ellipsis related options:
	ellipsisSelectText: true, //if select is resized smaller then dropdown text, will we add a "..." to end of it to indicate overflow. NOTE: if true, all options below are enabled:
	ellipsisText: "...",
	charWidth: null, //set to null to calculate width automatically (this may not work if your input has styles other then the ones that come with this widget). value in pixels.

	//this is run on init of the widget. $select is the widget, $input is the hidden input (may be null if 'useHiddenInput' = false)
	onInit: function($select, $input){

	},
	//on select callback:
	onSelect : function(value, text, selectIndex){
						//this = $select, this is fired when user selects something
	}
}};
//use this to filter a set of dropdownReplacement elements.
//first we search the input elements that are visible, after that we search the hidden inputs.
//takes a jquery as an argument, ex:
//$dr.is(":dr(#someid)")
//will return a dropdown replacement which has an id of someid OR a dropdown replacement that has a hidden input with that id.
//
$.expr[":"].dr = function(obj, index, meta, stack){
	var selector = meta[3];
	var drData = $(obj).dropdownReplacement("option");
	return drData && (drData.getSelect().is(selector) || drData.getHidden() ? drData.getHidden().is(selector) : false);
};

$.fn.dropdownReplacement = function(opts, operator){
  if(typeof opts === "string" && opts === "option"){
    var data = $(this).data("dropdownReplacement");
    return (arguments.length == 2) ? data[operator]() : data;
  }
	opts = $.extend({}, $.dropdownReplacement.defaults, $.isFunction(opts) ? {"onSelect":opts} : opts);

	var $self = this;
	var $body = $("body");
	var $window = $(window);
	var msie8 = $.browser.msie && (parseInt($.browser.version, 10) == 8);
	var oldIE = $.browser.msie && (parseInt($.browser.version, 10) <= 7);

	var textList = [];
	var textToOption = {};//used for selecting the correct option when clicking on a select
	var valueToText = {};
	var textToValue = {};
	var optionLookup = {};
	var winHeight, winWidth, optionHeight, optionsHeight, optionsWidth, selectHeight, selectWidth;

	var $options;
	var $hiddenInputs = [];

	var $selectedOption = $([]); //
	var $selectedSelect = $([]); //which select is currently droppped down

  var selectedSelectIndex = null;
  var selectText = []; //each select's text indexed by select index
	var enableBlur = true;
	var optionsShowing = [];//list of booleans indexed
	var charWidth = null; //how wide is one char. if null, char width is not used
	var ellipsisWidth = null;
	var detectedCharWidths = {};
	var selectWidths = []; //last known widths of selects indexed by selectedSelectIndex
	var originalOptionsWidth = -1; // we know that options can be atleast this small;
  var classes = {selectClass : "dropdown"};//classes used by the widget. classes coming from the options are extra //TODO: add all the others in here
  var $rv = $([]); //this is returned outside this fn

	var event = { //events
		lastLookupWord : null,
		lastLookupIndex: 0,
		options: function(e){ //options box - this is triggered when user clicks in the options box
			var $option = $(e.target);
			if($option.is("a")){
				setOptionsVisible(false);
				hightlightSelectedOption($option);
				setSelection();
				e.stopPropagation();
				return false;
			}
		},
		focus: function(e){
		  $selectedSelect = $(this);
			selectedSelectIndex = e.data.index;
			var text = getSelectText();
			var $option = textToOption[text];
		  hightlightSelectedOption($option);
		  this.selectionStart = this.selectionEnd = -1;
		},
		select : function(e){ //this = select box - this is trigged when user clicks the select box
			$selectedSelect = $(this);
			this.selectionStart = this.selectionEnd = -1;
			selectedSelectIndex = e.data.index;
			if(isOptionsVisible()){
				setOptionsVisible(false);
				return;
			}
			var text = getSelectText();
			var $option = textToOption[text];
			setOptionsVisible(true);
		    hightlightSelectedOption($option);
		},
		unselect: function(e){ // - this is triggered when user clicks outside the select box, or tabs out
			if(enableBlur){
				setOptionsVisible(false);
			}
		},
		optionsOver: function(){// - this is triggered when user mouses over the options box
			enableBlur = false;
			$selectedOption.removeClass(opts.optionSelectedClass);
		},
		optionsOut: function(){// - this is triggered when user mouses out of the options box
			enableBlur = true;
		},
		selectLookup: function(word){ // select an option by a <= 3 char sequence typed at the select - triggered on key up over select box/input (debounced)
			var optionList = null;
			var chop = opts.lookupMaxWordLength > word.length ? opts.lookupMaxWordLength : word.length;
			for(var i = 0; (!optionList && i < chop); i++) {//match longest first, then back down
				word = word.substring(0, opts.lookupMaxWordLength - i);
				optionList = optionLookup[word];
			}
			if(!optionList){
				return;
			}
			if(event.lastLookupWord === word){
				event.lastLookupIndex = event.lastLookupIndex + 1;
			} else {
				event.lastLookupIndex = 0;
				event.lastLookupWord = word;
			}

			if(optionList && optionList.length){
				if(optionList.length <= event.lastLookupIndex){
					event.lastLookupIndex = 0;
				}
				var $option = optionList[event.lastLookupIndex];
				hightlightSelectedOption($option);
				setSelection();
			}
		}
  };

  var onSelect = function($select, value, text, index){
    opts.onSelect.apply($select, [value, text, index]);
  };

  var detectCharWidth = function(testText){
	    if(opts.charWidth) {
				return opts.charWidth;
			}
	    var val = testText || "a b c d e f 1 2 3 4 5 6 A B C D E F ! ! %"; //correct detection depends on this more then anything
        if(!detectedCharWidths[val]){
				var $inp = $("<span>", {
					"text":val,
					"class":opts.selectClass,
					"css": {"background":"none", "margin":0, "padding":0, "overflow":"visible", "width":"auto", "color":"#FFF"}
				});
				$body.append($inp);
				detectedCharWidths[val] = ($inp.width() / val.length);
				$inp.remove();
        }
        return detectedCharWidths[val];
  };

    var setOptionsVisible = function(visible){
        optionsShowing[selectedSelectIndex] = visible;
        if(visible){
            repositionOptions();
        }
        $options[(visible ? "show" : "hide")]();
        if(visible){
            resizeOptionsWidth($selectedSelect);
        }
    };
	var isOptionsVisible = function(){
		return optionsShowing[selectedSelectIndex];
	};

	var setSelection = function(text){
		text = text || $selectedOption.text();
		var value = textToValue[text];
		setSelectText($selectedSelect, text);
		if(opts.useHiddenInput){
			$hiddenInputs[selectedSelectIndex].val(value);
		}
		onSelect($selectedSelect, value, text, selectedSelectIndex);
	};

	var getSelectText = function(index){
		return selectText[arguments.length ? index : selectedSelectIndex];
	};

	var setSelectValue = function($select, value, index){
		selectedSelectIndex = index;
		$selectedSelect = $select;
	    setSelection(valueToText[value]);
	};

	var setSelectText = function($select, text){
		selectText[selectedSelectIndex] = text;
		if(opts.ellipsisSelectText){
			charWidth = detectCharWidth(text);
			var selectWidth = $select.width();
			var maxChars = ~~(selectWidth / charWidth);
			if(maxChars < text.length) {
				maxChars -= ~~((ellipsisWidth + 5)  / charWidth);
				text = text.substring(0, maxChars) + opts.ellipsisText;
			}
		}
		$select.val(text);
	};

	var hightlightSelectedOption = function($option){
		$selectedOption.removeClass(opts.optionSelectedClass);
		if($option){
			$selectedOption = $option;
			$selectedOption.addClass(opts.optionSelectedClass);
		}
		if(isOptionsVisible() && jQuery.scrollTo){
			$option && $options.scrollTo($option);
		}
	};

	var constructOptions = function($select){ //this is done once: order #1
		selectedSelectIndex = 0;
		var constructWithPrebuildOptions = function(){
			$options = opts.options;
			var json = [];
			var l = $options.find("a");
			for(var i = 0; i < l.length; i++){
				var $option = $(l[i]);
				json[i] = {"t": $option.text(), "v": $option.attr("name")};
				$option.addClass(opts.optionClass);
				textToOption[json[i].t] = $option;
				valueToText[json[i].v] = json[i].t;
			}
			opts.options = json;
		};
		var constructWithJSONOptions = function(){
			var l = opts.options;
            if(l.length == 0){
                exception("options list must contain values, ex: [{'t':'text', 'v':'value'}]");
            }
            if(typeof l[0].t == "undefined" || typeof l[0].v == "undefined" ){
                exception("options json list must contain a list of objects with 2 keys: 't', and 'v'. ex: [{'t':'text', 'v':'value'}]");
            }
			$options = $("<div>");
			for(var i = 0; i < l.length; i++){
				var $option = $("<a>", {
					href:"#",
					name: l[i].v,
					text: l[i].t,
					"class":opts.optionClass
				});
				$options.append($option);
				textToOption[l[i].t] = $option;
				valueToText[l[i].v] = l[i].t;
			}
			$body.append($options);
		};
		var constructWithNativeSelect = function(){
			if($self.length > 1){
				throw exception("trying to widgetize more then ONE 'select' at a time is not supported. You can widgetize multiple 'input' elements.");
			}
			var l = $select.find("option");
			if(l.length === 0){
				throw exception("'select' must have ONE or more options elements as children in order to widgetize the select");
			}
			opts.options = [];
			var $newSelect = $("<input>", {
				"css": {"width": $select.width()}
			});
			for(var i = 0; i < l.length; i++){
				var $option = $(l[i]);
				var value = $option.val();
				var text = $option.text();
				opts.options[i] = {"t":text, "v":value};
				if($option.is(":selected")){
					$newSelect.val(text);
				}
			}
			$select.after($newSelect);
			if(opts.useHiddenInput){
				$hiddenInputs[0] = $select;
				$select.hide();
			} else {
                $newSelect.attr("name", $select.attr("name"));
			    $select.remove();
			}
			$select = $self = $newSelect;
			constructWithJSONOptions();
		};

	    if($select.is("select")){ //the element widgetized was a select
			constructWithNativeSelect();
		} else if(opts.options instanceof jQuery){ //input was widgetized, options are prebuilt
			constructWithPrebuildOptions();
		} else { //input widgetized, options are a json list
			constructWithJSONOptions();
		}
		var l = opts.options; //at this point options should be json options
		for(var i = 0; i < l.length; i++){
			textList[textList.length] = l[i].t;
			textToValue[l[i].t] = l[i].v;
		}
		$options.addClass(opts.optionsClass);
		$options.click(event.options);
		$options.mouseover(event.optionsOver);
		$options.mouseleave(event.optionsOut);
		if($.fn.bgiframe) {
       $options.bgiframe();
    }
    originalOptionsWidth = $options.width();
	};

	var buildTextLookupMap = function(){  //this is done once: order #2
		for(var i = 0; i < textList.length; i++){
			for(var j = 1; j < (opts.lookupMaxWordLength + 1); j++){
				if(textList[i].length >= j){
					var letters = textList[i].substring(0, j).toUpperCase();
					if(!optionLookup[letters]){
						optionLookup[letters] = [];
					}
					optionLookup[letters].push(textToOption[textList[i]]);
				}
			}
		}
	};

	var resizeOptions = function($select){ // this is done once: order #3
	  var $firstOption = textToOption[textList[0]];
		$options.show();
		var selectVisible = $select.is(":visible");
		if(!selectVisible){
			$select.show();
		}
    var optionHeight = $firstOption.outerHeight(true); //we can only get height if its visible
    var requestedHeight = opts.optionsDisplayNum * optionHeight ;
		var preferedHeight = $options.height();
		resizeOptionsWidth($select);
		if(!selectVisible){
			$select.hide();
		}
		$options.hide();

		$options.css({
			height: (preferedHeight < requestedHeight ? preferedHeight : requestedHeight) + (msie8 ? 2 : 0)
		});
	};

	var resizeOptionsWidth = function($select){ //$options should be visible when this is done, or weird things happen on IE
	    var oldWidth = selectWidths[selectedSelectIndex];
	    selectWidth = $select.outerWidth(true);
	    var preferedWidth = $options.width();
		if(preferedWidth == oldWidth && selectWidth == preferedWidth){
			return;
		}

		if(opts.resizeSelectToFitOptions && preferedWidth > selectWidth){
		//	$self.each(function(){
				//$(this)
				$select.width(preferedWidth + opts.optionsWidthOffset);
		//	});
			selectWidth = preferedWidth ;
		}
		if(opts.resizeOptionsToFitSelect && preferedWidth < selectWidth){
			selectWidth -= opts.optionsWidthOffset;
		} else if(opts.resizeOptionsToFitSelect && preferedWidth > selectWidth && preferedWidth > originalOptionsWidth){
			preferedWidth = selectWidth - opts.optionsWidthOffset;
		}
		var newWidth = (preferedWidth > selectWidth ? preferedWidth : selectWidth);
		$select.data("dropdownReplancement.width", newWidth);
		selectWidths[selectedSelectIndex] = newWidth;
		$options.width(newWidth);
	};

	var repositionOptions = function(){
		var offset = $selectedSelect.offset();
		var top = offset.top;
		var left = offset.left;

		if(top + optionsHeight > winHeight + $window.scrollTop() && offset.top - optionsHeight > 0){
			top = offset.top - optionsHeight;
		} else {
			top = top + selectHeight;
		}
		if(!opts.resizeSelectToFitOptions && left + optionsWidth  > winWidth){
			left -= (optionsWidth - selectWidth);
		}
		$options.css({
			"top": top ,
			"left": left
		});
	};

	var getDebouncedKeyUp = function() {
		var timer;
		var word = [];
		return function(e) {
			var args = arguments;
			word.push(String.fromCharCode(e.keyCode));
			clearTimeout(timer);
			timer = setTimeout(function() {
				event.selectLookup(word.join(""));
				timer = null;
				word = [];
			}, opts.debounceLookupMs);
		};
	};

	var arrowMove =	function(direction){ //direction is "prev" or "next"
		var $newSelected;
		if(direction !== "first" && direction !== "last"){
			if($selectedOption.length > 0) {
				$newSelected = $selectedOption[direction]("a");
			} else {
				$newSelected = textToOption[textList[0]]; //select first on the list if initial selection not on the list
			}
		} else {
			if(direction === "first"){
				$newSelected = textToOption[textList[0]];
			} else {
				$newSelected = textToOption[textList[textList.length - 1]];
			}
		}
		if($newSelected.length === 0){
			return false; //cant move there
		} else {
			hightlightSelectedOption($newSelected);
			return true;
		}
	};

	var debounceArrows = function() {
			var timer;
			var directions = [];
			directions[38] = "prev"; //up
			directions[40] = "next"; //down
			directions[33] = "first"; //page up
			directions[34] = "last"; //page down
			return function(e) {
				var direction = directions[e.keyCode];
				if(direction){
					if(arrowMove(direction)){
						clearTimeout(timer);
						timer = setTimeout(function() {
							setSelection();
							timer = null;
						}, opts.debounceArrowsMs);
					}
				}
			};
	};

	var calculateWindowBounds = function(){
	  var oldW = winWidth;
	  var oldH = winHeight;
		winWidth = $window.width();
		winHeight = $window.height();
		var w = Math.abs(oldW - winWidth);
		var h = Math.abs(oldH - winHeight);
		return (w > opts.scrollWidth && h > opts.scrollWidth); //true if window size changed
	};

	var calculateDimensions = function($select){
		var vis = $select.is(":visible");
		if(!vis){
			$select.show();
		}
		selectWidth = $select.outerWidth(true);
		selectHeight = $select.outerHeight(true);
		optionsHeight = $options.outerHeight(true);
		optionsWidth = $options.outerWidth(true);
		if(!vis){
			$select.hide();
		}
	};

	var skinSelectBox = function($select){
		$select.addClass(classes.selectClass);
        if(opts.selectClass){ $select.addClass(opts.selectClass); }
		if($.support.windowsTheme && $.support.windowsTheme.name){
			$select.addClass("dd-theme-"+$.support.windowsTheme.name);
			$options.addClass("opt-theme-"+$.support.windowsTheme.name);
		} else {
			$select.addClass("dd-all");
		}
		if(oldIE){ //browser specific settings must go in here!
			$select.addClass("dd-oldIE");
		}
	};

	var browserSpecificSettings = function(){
		if(msie8){
			opts.optionsWidthOffset -= 3;
		}
	};

	var exception = function(str){
		return "jquery.dropdownReplacement exception: "+str;
	};


	var addJQData = function($select, $input, index){
		//get this data structure via $(elem).dropdownReplacement("option")
		var data = {
			"val": function(value){
				if(arguments.length == 1){
                    value = valueToText[value] ? value : textToValue[textList[0]];
					setSelectValue($select, value, index);
				} else {
					return textToValue[$select.val()];
				}
			},
			"text": function(text){
				if(text){
					setSelectValue($select, textToValue[text], index);
				} else {
					return getSelectText(index);
				}
			},
			"getSelect": function(){
				return $select;
			},
			"getHidden": function(){
			  return $input; //will return null if hidden inputs arent used
			}
		};
		$select.data("dropdownReplacement", data);
		if($input){
			$input.data("dropdownReplacement", data);
		}
	};
	var init = function(){
		if(!jQuery.scrollTo){
			throw exception("jquery.scrollTo plugin is required for this plugin. http://plugins.jquery.com/project/ScrollTo");
		}
		browserSpecificSettings();
		var $firstSelect = $($self[0]);
		if(opts.ellipsisSelectText){
			charWidth = detectCharWidth();
			ellipsisWidth = detectCharWidth(opts.ellipsisText) * opts.ellipsisText.length;
		}
		constructOptions($firstSelect);
		buildTextLookupMap();
		calculateWindowBounds();

        $window.resize(function(){
			if(calculateWindowBounds()){
				setOptionsVisible(false); //hide if bounds changed
			}
		});

		$self.each(function(index){
			var $this = $(this);
			var $select;
			var thisIsSelect =  $this.is("select");
			selectWidths[index] = -1;
			if(!$this.is("input") && !thisIsSelect){
				throw exception("root element must be an 'input' or 'select'");
			}
			selectedSelectIndex = index;
			if(opts.useHiddenInput && !thisIsSelect && !$hiddenInputs[index]){
				$select = $("<input>");
				$select.val($this.val());
				$this.after($select);
			} else {
				$select = $this;
			}
			$rv = $rv.add($select);
			if(opts.selectCssWidth){
				$select.css({"width": opts.selectCssWidth}); //TODO: this might want to be right before 'ellipsisSelectText'
			}

			skinSelectBox($select);
			if(index === 0){
				resizeOptions($select);
				calculateDimensions($select);
			}
			var selectDefaultSelection = $select.val();
			if(opts.useHiddenInput && !thisIsSelect && valueToText[selectDefaultSelection]){
				selectDefaultSelection = valueToText[selectDefaultSelection]; //if the thing we widgetize is going to be the hidden input, then its value should be the value, not the text. right?
			} else if(!textToValue[selectDefaultSelection]){
				selectDefaultSelection = textList[0];
			}
			setSelectText($select, selectDefaultSelection);

			if(opts.useHiddenInput && !$hiddenInputs[index]){
			  $this.hide();
			  $hiddenInputs[index] = $this;
			}
			addJQData($select, $hiddenInputs[index], index);

			$select.attr("readonly", "true");
			$select.bind("click", {"index":index}, event.select)
						 .bind("blur",{"index":index},event.unselect)
						 .bind("focus",{"index":index}, event.focus)
						 .keyup(getDebouncedKeyUp())
						 .keydown(debounceArrows())
						 .keydown(function(e){
								if(e.keyCode == 13 || e.keyCode == 27){
									setOptionsVisible(false);
									$select.blur();
								}
							});
            opts.onInit($select, $hiddenInputs[index]);
		});
	};
	init();
	return $rv;
};
}(jQuery));