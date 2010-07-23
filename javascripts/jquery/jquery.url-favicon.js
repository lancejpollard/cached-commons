/**
 * jQuery UrlFavicon Plugin
 * Version 0.1 Release
 * Url: http://urlfavicon.danswackyworld.com
 * Author: Daniel Yates
 * Copyright © Daniel Yates 2009-2010 
 * 
 * Usage;
 *
 *	To use this plugin, simply call: $('a').urlfavicon();
 *	to prepend a favicon to all URL's with default settings.
 *
 *	This work is licenced under the
 *	Creative Commons Attribution-Non-Commercial 2.0 UK: England & Wales License.
 *
 *	To view a copy of this licence, visit
 *	http://creativecommons.org/licenses/by-nc/2.0/uk/
 *
 *	or send a letter to
 *	Creative Commons, 171 Second Street, Suite 300, San Francisco, California 94105, USA.
 *
 */
(function($) {
	$.fn.urlfavicon = function(exclude, icon, callbacks) {
		/**
		 * Default settings for this plugin.
		 */
		var Config = {
			Exclude: {
				LocalUrls: false,
				Classes: [],
				Children: ['img'],
				Urls: []
			},
			Icon: {
				GetFavicon: true,
				Default: '/img/nav/default.gif',
				Prepend: true,
				Append: false,
				Class: ''
			},
			Callbacks: {
				OnElementAccessed : null,
				OnElementModified: null,
				OnInvalidUrl: null
			}
		};
		// Combine the configuration to make awesomesauce!
		if (exclude) $.extend(Config.Exclude, exclude);
		if (icon) $.extend(Config.Icon, icon);
		if (callbacks) $.extend(Config.Callbacks, callbacks);
		// Go through all matched elements.
		return this.each(function() {
			// Create a var to filter out/exclude elements as needed.
			// Use an attribute selector, filter out ones which don't have
			// "http at the beginning of the href attr.
			$elems = $(this).filter('[href^="http"]');
			// Check our config for excluding local urls.
			if(Config.Exclude.LocalUrls) {
				// Excluding local urls, filter out the bad ones.
				// Use *=, which means contains substring.
				$elems = $elems.not('[href*="' + document.domain + '"]');
			};
			// Go through exclude.classes.
			$(Config.Exclude.Classes).each(function(){
				// For each elem, keep elements which don't contain this class.
				$elems = $elems.not('[class*="' + this.toString() + '"]');
			});
			// Check the excluding of child ements.
			$(Config.Exclude.Children).each(function(){
				// For each elem, keep elements without children of this type.
				$elems = $elems.not(':has(' + this.toString() + ')');
			});
			// Filter Urls.
			$(Config.Exclude.Urls).each(function(){
				// For each elem, keep those without the link.
				$elems = $elems.not('[href*="' + this.toString() + '"]');
			});
			// Loopy through the remaining elements.
			$elems.each(function(){
				// Callback - OnElementAccessed.
				if($.isFunction(Config.Callbacks.OnElementAccessed)){
					Config.Callbacks.OnElementAccessed($(this));
				};
				// Create an image element.
				var img = document.createElement('img');
				// If the class is given, apply it.
				if(Config.Icon.Class != '') {
					$(img).addClass(Config.Icon.Class);
				};
				// If we're getting the favicon, parse the URL.
				if(Config.Icon.GetFavicon) {
					// Parse the URL with regex goodness.
					var http = '(http:\\/\\/)';
					var fqdn = '((?:[a-z][a-z\\.\\d\\-]+)\\.(?:[a-z][a-z\\-]+))'
								+ '(?![\\w\\.])';
					var url = new RegExp(http + fqdn, ['i'])
						.exec($(this).attr('href'));
					// If the URL is null, we can't get a domain name from the
					// href attr. Fallback to default icon.
					if(url != null) {
						// Image source = URL + Favicon.
						$(img).attr('src', url[0] + '/favicon.ico');
						// On error, fallback to default icon.
						$(img).error(function() { 
							$(img).attr('src', Config.Icon.Default);
						});
					} else {
						// Callback - OnInvalidUrl.
						if($.isFunction(Config.Callbacks.OnInvalidUrl)){
							Config.Callbacks.OnInvalidUrl($(this));
						};
						// Fallback to default.
						$(img).attr('src', Config.Icon.Default);
					};
				} else {
					// Fallback to default.
					$(img).attr('src', Config.Icon.Default);
				};
				// Prepend/Append as needed.
				if(Config.Icon.Prepend) { $(this).prepend($(img)); };
				if(Config.Icon.Append) { $(this).append($(img)); };
				// Callback - OnElementModified.
				if($.isFunction(Config.Callbacks.OnElementModified)){
					Config.Callbacks.OnElementModified($(this));
				};
			});
		});
	};
})(jQuery);