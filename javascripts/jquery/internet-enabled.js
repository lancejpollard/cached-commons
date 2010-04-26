var InternetEnabled = {};

InternetEnabled.init = function() {
	// define scripts
	var scripts = [];
	if (typeof jQuery == "undefined") {
		scripts.push("http://cachedcommons.org/javascripts/jquery/jquery.ie6-update-min.js");
		scripts.push("http://cachedcommons.org/javascripts/jquery/jquery-1.4.2-min.js");
	} else {
		scripts.push("http://cachedcommons.org/javascripts/jquery/jquery.ie6-update-min.js");
	}

	var head = document.getElementsByTagName('head')[0];
	var loaded = 0;
	
	for (var i = 0; i < scripts.length; i++) {
		var script = document.createElement('script');
	  var url = scripts[i];
		script.setAttribute('src', url);
		script.setAttribute('type','text/javascript');
		script.onload = function() {
			loaded++;
			if (loaded == scripts.length) {
				var message = 'Internet Explorer is missing updates required to view this site. Click here to update... ';
				$('<div></div>').html(message).activebar({
					'icons_path': 'http://cachedcommons.org//images/ie6update/',
					'url': 'http://internetenabled.org'
				});
			}
		}
		head.appendChild(script);
	}
}

InternetEnabled.init();