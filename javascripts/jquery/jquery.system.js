/*
 * jQuery System plugin 0.1
 *
 * Copyright (c) 2010 Lance Pollard
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

/* http://www.quirksmode.org/js/detect.html */
/* http://en.wikipedia.org/wiki/List_of_user_agents_for_mobile_phones */
/* http://upload.wikimedia.org/wikipedia/commons/7/74/Timeline_of_web_browsers.svg */
;(function( $ ){
	/* api */
	$.system = {
		browser: {
			safari: false,
			firefox: false,
			ie: false,
			opera: false,
			chrome: false,
			netscape: false,
			other: false
		},
		os: {
			windows: false,
			mac: false,
			linux: false,
			iphone: false,
			ipod: false,
			android: false,
			ipad: false,
			blackberry: false,
			motorola: false,
			nokia: false,
			other: false
		},
		/* implementation */
		searchString: function (data) {
			for (var i = 0; i < data.length; i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1)
				return;
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},
		searchPlatform: function (dataString, data) {
			for (var i = 0; i < data.length; i++)	{
				var string = data[i].string;
				var name = data[i].name;
				if (dataString.indexOf(string) != -1)
					return name;
			}
		},
		searchDate: function (browser, version, data) {
			for (var i = 0; i < data.length; i++)	{
				if (data[i].browser == browser) {
					data[i].versions = data[i].versions.reverse();
					for (var j=0;j<data[i].versions.length;j++)	{
						var val = data[i].versions[j].version;
						if (val == version)
							return data[i].versions[j].date;
						else if (Math.floor(val) == Math.floor(version))
							return data[i].versions[j].date;
					}
				}
			}
		},
		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{ 
				string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Internet Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{ 		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],
		dataBrowserDate : [
			{
				browser: "Internet Explorer",
				versions: [
					{
						version: 1.0,
						date: 1995
					},
					{
						version: 2.0,
						date: 1995
					},
					{
						version: 3.0,
						date: 1996
					},
					{
						version: 4.0,
						date: 1997
					},
					{
						version: 5.0,
						date: 1999
					},
					{
						version: 6.0,
						date: 2001
					},
					{
						version: 7.0,
						date: 2006
					},
					{
						version: 8.0,
						date: 2009
					}
				]
			},
			{
				browser: "Safari",
				versions: [
					{
						version: 1.0,
						date: "June 23, 2003"
					},
					{
						version: 1.03,
						date: "August 13, 2004"
					},
					{
						version: 2.0,
						date: "April 29, 2005"
					},
					{
						version: 2.02,
						date: "October 31, 2005"
					},
					{
						version: 2.04,
						date: "January 10, 2006"
					},
					{
						version: 3.0,
						date: "June 11, 2007"
					},
					{
						version: 3.2,
						date: "November 13, 2008"
					},
					{
						version: 3.23,
						date: "May 12, 2009"
					},
					{
						version: 4.0,
						date: "June 8, 2009"
					},
					{
						version: 4.04,
						date: "November 11, 2009"
					}
				]
			},
			{
				browser: "Opera",
				versions: [
					{
						version: 4.0,
						date: "June, 2000"
					},
					{
						version: 5.0,
						date: "December, 2000"
					},
					{
						version: 6.0,
						date: "November, 2001"
					},
					{
						version: 7.0,
						date: "January, 2003"
					},
					{
						version: 7.5,
						date: "May, 2004"
					},
					{
						version: 8.0,
						date: "April, 2005"
					},
					{
						version: 8.5,
						date: "Sepember, 2005"
					},
					{
						version: 9.0,
						date: "June, 2006"
					},
					{
						version: 10.0,
						date: "September, 2009"
					},
					{
						version: 10.5,
						date: "March, 2010"
					}
				]
			},
			{
				browser: "Chrome",
				versions: [
					{
						version: 1.0,
						date: "December 11, 2008"
					},
					{
						version: 2.0,
						date: "May 24, 2009"
					},
					{
						version: 3.0,
						date: "October 10, 2009"
					},
					{
						version: 4.0,
						date: "January 25, 2010"
					},
					{
						version: 5.0,
						date: "April 09, 2010"
					}
				]
			}
		],
		dataOS : [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
			   string: navigator.userAgent,
			   subString: "iPad",
			   identity: "iPad"
		  },
			{
			   string: navigator.userAgent,
			   subString: "iPod",
			   identity: "iPod"
		  },
			{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone"
		  },
			{
			   string: navigator.userAgent,
			   subString: "Android",
			   identity: "Android"
		  },
			{
			   string: navigator.userAgent,
			   subString: "BlackBerry",
			   identity: "BlackBerry"
		  },
			{
			   string: navigator.userAgent,
			   subString: "Motorola",
			   identity: "Motorola"
		  },
			{
			   string: navigator.userAgent,
			   subString: "Nokia",
			   identity: "Nokia"
		  },
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		],
		
		dataPlatform : [
			{
				string: "Windows NT 6.0",
				name: "Windows Vista"
			},
			{
				string: "Windows NT 5.2",
				name: "Windows Server 2003; Windows XP x64 Edition"
			},
			{
				string: "Windows NT 5.1",
				name: "Windows XP"
			},
			{
				string: "Windows NT 5.01",
				name: "Windows 2000, Service Pack 1 (SP1)"
			},
			{
				string: "Windows NT 5.0",
				name: "Windows 2000"
			},
			{
				string: "Windows NT 4.0",
				name: "Microsoft Windows NT 4.0"
			},
			{
				string: "Windows 98; Win 9x 4.90",
				name: "Windows Me"
			},
			{
				string: "Windows 98",
				name: "Windows 98"
			},
			{
				string: "Windows 95",
				name: "Windows 95"
			},
			{
				string: "Windows CE",
				name: "Windows CE"
			},
			{
				string: "Mac_PowerPC",
				name: "Mac OSX PPC"
			},
			{
				string: "Intel Mac",
				name: "Mac OSX Intel"
			}
		]
	};
	
	/* setting */
	$.system.browser.name = $.system.searchString($.system.dataBrowser) || "An unknown browser";
	$.system.browser.version = $.system.searchVersion(navigator.userAgent)
				|| $.system.searchVersion(navigator.appVersion)
				|| "an unknown version";
	$.system.browser.date = $.system.searchDate($.system.browser.name, $.system.browser.version, $.system.dataBrowserDate);
	name = $.system.browser.name.toLowerCase();
	if (name == "internet explorer")
		name = "ie";
	if (name in $.system.browser)
		$.system.browser[name] = true;
	$.system.os.name = $.system.searchString($.system.dataOS) || "an unknown OS";
	$.system.os.platform = $.system.searchPlatform(navigator.userAgent, $.system.dataPlatform);
	name = $.system.os.name.toLowerCase();
	if (name in $.system.os)
		$.system.os[name] = true;
})(jQuery);