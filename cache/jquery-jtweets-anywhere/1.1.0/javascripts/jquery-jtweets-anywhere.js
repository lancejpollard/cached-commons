/*
 * jTweetsAnywhere V1.1.0
 * http://thomasbillenstein.com/jTweetsAnywhere/
 *
 * Copyright 2010, Thomas Billenstein
 * Licensed under the MIT license.
 * http://thomasbillenstein.com/jTweetsAnywhere/license.txt
 */
(function($)
{
	$.fn.jTweetsAnywhere = function(options)
	{
		// setup the default options
		var options = $.extend(
		{
			// the user's name who's tweet feed or list feed is displayed. This
			// param is also used when a Twitter "Follow Button" is displayed. Usually
			// this param is a string, but can also be an array of strings. If an array
			// is supplied (and the params 'list' and 'searchParams' are null), a
			// combined feed of all users is displayed.
			// Sample: 'tbillenstein' or ['twitterapi', '...', '...']
			username: 'tbillenstein',

			// the name of a user's list where the tweet feed is generated from
			list: null,

			// a single search param string or an array of search params, to be used in
			// a Twitter search call. All Twitter Search Params are supported (See here
			// for the details: http://apiwiki.twitter.com/Twitter-Search-API-Method%3A-search).
			// Sample: 'q=twitter' or ['q=twitter', 'geocode=48.856667,2.350833,30km']
			searchParams: null,

			// the number of tweets shown in the tweet feed. If this param is 0, no feed
			// is displayed.
			count: 0,

			// a flag (true/false) that specifies whether to display a profile images in
			// tweets. If the param is set to null (the default value), a profile image
			// is displayed only if the feed represents a user's list or the result of a
			// Twitter search.
			tweetProfileImagePresent: null,

			// a flag (true/false) that specifies whether to display a Tweet Feed
			// or an object literal representing the configuration options for the
			// Tweet Feed. This flag works in conjunction with the count parameter:
			// - if count equals 0, no feed is displayed, ignoring showTweetFeed
			// - if count not equals 0 and showTweetFeed equals false, no feed
			//   is displayed
			// {
			//     showSource: false,			// Boolean - Show info about the source of the tweet
			//     expandHovercards: false		// Boolean - Show Hovercards in expanded mode
			// }
			showTweetFeed: true,

			// a flag (true/false) that specifies whether to display a Twitter "Follow
			// Button".
			showFollowButton: false,

			// a flag (true/false) that specifies whether to display a Twitter "Connect
			// Button" or an object literal representing the configuration options for
			// the "Tweet Box".
			// {
			//     size: 'medium'				// String - The size of the Connect Button. Valid values are: small, medium, large, xlarge
			// }
			showConnectButton: false,

			// a flag (true/false) that specifies whether to display Login Infos.
			showLoginInfo: false,

			// a flag (true/false) that specifies whether to display a Twitter "Tweet
			// Box" or an object literal representing the configuration options for
			// the "Tweet Box".
			// {
			//     counter: true,				// Boolean - Display a counter in the Tweet Box for counting characters
			//     width: 515,					// Number - The width of the Tweet Box in pixels
			//     height: 65,					// Number - The height of the Tweet Box in pixels
			//     label: "What's happening",	// String - The text above the Tweet Box, a call to action
			//     defaultContent: <none>,		// String - Pre-populated text in the Tweet Box. Useful for an @mention, a #hashtag, a link, etc.
			//     onTweet: <none>				// Function - Specify a listener for when a tweet is sent from the Tweet Box. The listener receives two arguments: a plaintext tweet and an HTML tweet
			// }
			showTweetBox: false,

			// a decorator is a function that is responsible for constructing a certain
			// element of the widget. Most of the decorators return a HTML string.
			// Exceptions are the mainDecorator, which defines the basic sequence of
			// the widget's components, plus the linkDecorator, the usernameDecorator
			// and the hashtagDecorator which return the string that is supplied as a
			// function param, enriched with the HTML tags.
			// For details, see the implementations of the default decorators. Each
			// default decorator can be overwritten by your own implementation.
			loadingDecorator: defaultLoadingDecorator,
			mainDecorator: defaultMainDecorator,
			tweetFeedDecorator: defaultTweetFeedDecorator,
			tweetDecorator: defaultTweetDecorator,
			tweetProfileImageDecorator: defaultTweetProfileImageDecorator,
			tweetBodyDecorator: defaultTweetBodyDecorator,
			tweetTextDecorator: defaultTweetTextDecorator,
			tweetAttributesDecorator: defaultTweetAttributesDecorator,
			tweetTimestampDecorator: defaultTweetTimestampDecorator,
			tweetSourceDecorator: defaultTweetSourceDecorator,
			connectButtonDecorator: defaultConnectButtonDecorator,
			loginInfoDecorator: defaultLoginInfoDecorator,
			loginInfoContentDecorator: defaultLoginInfoContentDecorator,
			followButtonDecorator: defaultFollowButtonDecorator,
			tweetBoxDecorator: defaultTweetBoxDecorator,
			linkDecorator: defaultLinkDecorator,
			usernameDecorator: defaultUsernameDecorator,
			hashtagDecorator: defaultHashtagDecorator,
			errorDecorator: defaultErrorDecorator,
			tweetFilter: defaultTweetFilter,

			_tweetFeedConfig:
			{
				showSource: false,
				expandHovercards: false
			},
			_tweetBoxConfig:
			{
				counter: true,
				width: 515,
				height: 65,
				label: "What's happening?",
				defaultContent: '',
				onTweet: function(textTweet, htmlTweet) {}
			},
			_connectButtonConfig:
			{
				size: "medium"
			},
			_baseSelector: null,
			_baseElement: null,
			_tweetFeedElement: null,
			_followButtonElement: null,
			_loginInfoElement: null,
			_connectButtonElement: null,
			_tweetBoxElement: null,
			_loadingIndicatorElement: null,
			_loadingCount: 0
		}, options);

		// no main decorator? nothing to do!
		if (!options.mainDecorator)
			return;

		options._baseSelector = this.selector;

		// if username is an array, create the search query and flatten username
		if (typeof(options.username) != 'string')
		{
			if (!options.searchParams)
				options.searchParams = ['q=from:' + options.username.join(" OR from:")];

			options.username = options.username[0];
		}

		// if tweetProfileImagePresent is not set to a boolean value, we decide to show
		// a profile image if the feed represents a user's list or the results of a
		// Twitter search
		if (options.tweetProfileImagePresent == null)
			options.tweetProfileImagePresent = (options.list || options.searchParams) && options.tweetProfileImageDecorator;

		// if showTweetFeed is not set to a boolean value, we expect the configuration of
		// the tweet feed
		if (typeof(options.showTweetFeed) == 'object')
		{
			options._tweetFeedConfig = options.showTweetFeed;
		}

		// if showTweetBox is not set to a boolean value, we expect the configuration of
		// the TweetBox
		if (typeof(options.showTweetBox) == 'object')
		{
			options._tweetBoxConfig = options.showTweetBox;
			options.showTweetBox = true;
		}

		// if showConnectButton is not set to a boolean value, we expect the
		// configuration of the Connect Button
		if (typeof(options.showConnectButton) == 'object')
		{
			options._connectButtonConfig = options.showConnectButton;
			options.showConnectButton = true;
		}

		options.count = validateRange(options.count, 0, 100);

		// internally, the decision of which widget parts are to be displayed is based
		// on the existence of the decorators
		if (options.count == 0 || !options.showTweetFeed)
			options.tweetFeedDecorator = null;

		if (!options.showFollowButton)
			options.followButtonDecorator = null;

		if (!options.showTweetBox)
			options.tweetBoxDecorator = null;

		if (!options.showConnectButton)
			options.connectButtonDecorator = null;

		if (!options.showLoginInfo)
			options.loginInfoDecorator = null;

		if (!options._tweetFeedConfig.showSource)
			options.tweetSourceDecorator = null;

		// setup ajax
		$.ajaxSetup({ cache: true });

		return this.each(function()
		{
			// the DOM element, where to display the widget
			options._baseElement = $(this);

			// if a tweet feed is to be displayed and there's a loading decorator,
			// signal LOADING ...
			if (options.tweetFeedDecorator && options.loadingDecorator)
			{
				addLoadingIndicator(options);
			}

			// optionally create the widget's sub DOM elements
			options._tweetFeedElement = options.tweetFeedDecorator ? $(options.tweetFeedDecorator(options)) : null;
			options._followButtonElement = options.followButtonDecorator ? $(options.followButtonDecorator(options)) : null;
			options._tweetBoxElement = options.tweetBoxDecorator ? $(options.tweetBoxDecorator(options)) : null;
			options._connectButtonElement = options.connectButtonDecorator ? $(options.connectButtonDecorator(options)): null;
			options._loginInfoElement = options.loginInfoDecorator ? $(options.loginInfoDecorator(options)) : null;

			// add the widget to the DOM
			options.mainDecorator(options);

			populateTweetFeed(options);
			populateAnywhereControls(options);
		});
	};
	defaultMainDecorator = function(options)
	{
		// defines the default sequence of the widget's elements
		if (options._tweetFeedElement)
			options._baseElement.append(options._tweetFeedElement);

		if (options._connectButtonElement)
			options._baseElement.append(options._connectButtonElement);

		if (options._loginInfoElement)
			options._baseElement.append(options._loginInfoElement);

		if (options._followButtonElement)
			options._baseElement.append(options._followButtonElement);

		if (options._tweetBoxElement)
			options._baseElement.append(options._tweetBoxElement);
	};
	defaultTweetFeedDecorator = function(options)
	{
		// the default placeholder for the tweet feed is an unordered list
		return '<ul class="jta-tweet-list"></ul>';
	};
	defaultTweetDecorator = function(tweet, options)
	{
		// the default tweet is made of the optional user's profile image and the
		// tweet body inside a list item element
		var html = '';
		if (options.tweetProfileImagePresent)
			html += options.tweetProfileImageDecorator(tweet, options);

		if (options.tweetBodyDecorator)
			html += options.tweetBodyDecorator(tweet, options);

		html += '<div class="jta-clear">&nbsp;</div>';

		return '<li class="jta-tweet-list-item">' + html + '</li>';
	};
	defaultTweetProfileImageDecorator = function(tweet, options)
	{
		// the default profile image decorator simply adds a link to the user's Twitter profile
		var screenName = tweet.user ? tweet.user.screen_name : false || tweet.from_user;
		var imageUrl = tweet.user ? tweet.user.profile_image_url : false || tweet.profile_image_url;

		var html =
			'<a class="jta-tweet-profile-image-link" href="http://twitter.com/' + screenName + '" target="_blank">' +
			'<img src="' + imageUrl + '" alt="' + screenName + '"' +
			(isAnywherePresent() ? '' : (' title="' + screenName + '"')) +
			'/>' +
			'</a>';

		return '<div class="jta-tweet-profile-image">' + html + '</div>';
	};
	defaultTweetBodyDecorator = function(tweet, options)
	{
		// the default tweet body contains the tweet text and the tweet's creation date
		var html = '';

		if (options.tweetTextDecorator)
			html += options.tweetTextDecorator(tweet, options);

		if (options.tweetAttributesDecorator)
			html += options.tweetAttributesDecorator(tweet, options);

		return '<div class="jta-tweet-body ' + (options.tweetProfileImagePresent ? 'jta-tweet-body-list-profile-image-present' : '') + '">' + html + '</div>';
	};
	defaultTweetTextDecorator = function(tweet, options)
	{
		// the default tweet text decorator optionally marks links, @usernames, and
		// #hashtags
		var tweetText = options.linkDecorator ? options.linkDecorator(tweet.text, options) : tweet.text;

		if (options.usernameDecorator)
			tweetText = options.usernameDecorator(tweetText, options);

		if (options.hashtagDecorator)
			tweetText = options.hashtagDecorator(tweetText, options);

		return '<span class="tweet-text">' + tweetText + '</span>';
	};
	defaultTweetAttributesDecorator = function(tweet, options)
	{
		var html = '';

		if (options.tweetTimestampDecorator || options.tweetSourceDecorator)
		{
			html += '<span class="jta-tweet-attributes">';

			if (options.tweetTimestampDecorator)
				html += options.tweetTimestampDecorator(tweet, options);

			if (options.tweetSourceDecorator)
				html += options.tweetSourceDecorator(tweet, options);

			html += '</span>';
		}

		return html;
	};
	defaultTweetTimestampDecorator = function(tweet, options)
	{
		// the default tweet timestamp decorator does a little bit of Twitter like formatting.
		var createdAt = formatDate(tweet.created_at);
		var diff = parseInt((new Date().getTime() - Date.parse(createdAt)) / 1000);

		var tweetTimestamp = '';
		if (diff < 60)
		{
			tweetTimestamp += 'less than a minute ago';
		}
		else if (diff < 3600)
		{
			var t = parseInt((diff + 30) / 60);
			tweetTimestamp += t + ' minute' + (t == 1 ? '' : 's') + ' ago';
		}
		else if (diff < 86400)
		{
			var t = parseInt((diff + 1800) / 3600);
			tweetTimestamp += 'about ' + t + ' hour' + (t == 1 ? '' : 's') + ' ago';
		}
		else
		{
			var t = parseInt((diff + 43200) / 86400);
			tweetTimestamp += 'about ' + t + ' day' + (t == 1 ? '' : 's') + ' ago';

			var d = new Date(createdAt);
			var period = 'AM';

			var hours = d.getHours();
			if (hours > 12)
			{
				hours -= 12;
				period = 'PM';
			}

			var mins = d.getMinutes();
			var minutes = (mins < 10 ? '0' : '') + mins;

			tweetTimestamp += ' ('  + hours + ':' + minutes + ' ' + period + ' ' + (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + ')';
		}

		var screenName = tweet.user ? tweet.user.screen_name : false || tweet.from_user;
		var html =
			'<span class="jta-tweet-timestamp">' +
			'<a class="jta-tweet-timestamp-link" href="http://twitter.com/' + screenName + '/status/' +
			tweet.id + '" target="_blank">' +
			tweetTimestamp +
			'</a></span>';

		return html;
	};
	defaultTweetSourceDecorator = function(tweet, options)
	{
		var source = tweet.source.replace(/\&lt\;/gi,'<').replace(/\&gt\;/gi,'>').replace(/\&quot\;/gi,'"');
		var html = '<span class="jta-tweet-source-link">' + source + '</span>';

		return '<span class="jta-tweet-source"> via ' + html + '</span>';
	};
	defaultConnectButtonDecorator = function(options)
	{
		// the default placeholder for the @Anywhere ConnectButton
		return '<div class="jta-connect-button"></div>';
	};
	defaultLoginInfoDecorator = function(options)
	{
		// the default placeholder for the LoginInfo
		return '<div class="jta-login-info"></div>';
	};
	defaultLoginInfoContentDecorator = function(options, T)
	{
		// the default markup of the LoginInfo content: the user's profile image, the
		// user's screen_name and a "button" to sign out
		var html = '';

		if (T.isConnected())
		{
			var screenName = T.currentUser.data('screen_name');
			var imageUrl = T.currentUser.data('profile_image_url');

			html =
				'<div class="jta-login-info-profile-image">' +
				'<a href="http://twitter.com/' + screenName + '" target="_blank">' +
				'<img src="' + imageUrl + '" alt="' + screenName + '" title="' + screenName + '"/>' +
				'</a>' +
				'</div>' +
				'<div class="jta-login-info-block">' +
				'<div class="jta-login-info-screen-name">' +
				'<a href="http://twitter.com/' + screenName + '" target="_blank">' + screenName + '</a>' +
				'</div>' +
				'<div class="jta-login-info-sign-out">' +
				'Sign out' +
				'</div>' +
				'</div>' +
				'<div class="jta-clear">&nbsp;</div>'
				;
		}

		return html;
	};
	defaultFollowButtonDecorator = function(options)
	{
		// the default placeholder for the @Anywhere FollowButton
		return '<div class="jta-follow-button"></div>';
	};
	defaultTweetBoxDecorator = function(options)
	{
		// the default placeholder for the @Anywhere TweetBox
		return '<div class="jta-tweet-box"></div>';
	};
	defaultLinkDecorator = function(text, options)
	{
		// the regex to markup links
		return text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" class="jta-tweet-a jta-tweet-link" target="_blank" rel="nofollow">$1<\/a>');
	};
	defaultUsernameDecorator = function(text, options)
	{
		// the regex to markup @usernames. if @Anywhere is present the task is left to
		// them
		return isAnywherePresent() ? text : text.replace(/@([a-zA-Z0-9_]+)/gi,'@<a href="http://twitter.com/$1" class="jta-tweet-a twitter-anywhere-user" target="_blank" rel="nofollow">$1<\/a>');
	};
	defaultHashtagDecorator = function(text, options)
	{
		// the regex to markup #hashtags
		return text.replace(/#([a-zA-Z0-9_]+)/gi,'<a href="http://search.twitter.com/search?q=%23$1" class="jta-tweet-a jta-tweet-hashtag" title="#$1" target="_blank" rel="nofollow">#$1<\/a>');
	};
	defaultLoadingDecorator = function(options)
	{
		// the default loading decorator simply says: loading ...
		return '<div class="jta-loading">loading ...</div>';
	};
	defaultErrorDecorator = function(errorText, options)
	{
		return '<div class="jta-error">ERROR: ' + errorText + '</div>';
	};
	defaultTweetFilter = function(tweet, options)
	{
		return true;
	};
	updateLoginInfoElement = function(options, T)
	{
		// update the content of the LoginInfo element
		if (options._loginInfoElement && options.loginInfoContentDecorator)
		{
			options._loginInfoElement.children().remove();
			options._loginInfoElement.append(options.loginInfoContentDecorator(options, T));
			$(options._baseSelector + ' .jta-login-info-sign-out').bind('click', function()
			{
				twttr.anywhere.signOut();
			});
		}
	};
	getFeedUrl = function(options)
	{
		// create the Twitter API URL based on the configuration options
		var url = ('https:' == document.location.protocol ? 'https:' : 'http:');

		if (options.searchParams)
		{
			var searchParams = (options.searchParams instanceof Array) ? options.searchParams.join('&') : options.searchParams;

			url += '//search.twitter.com/search.json?' + searchParams + '&rpp=' + options.count + '&callback=?';
		}
		else if (options.list)
		{
			url += '//api.twitter.com/1/' + options.username + '/lists/' + options.list + '/statuses.json?per_page=' +
				options.count + '&callback=?';
		}
		else
		{
			url += '//api.twitter.com/1/statuses/user_timeline.json?screen_name=' + options.username + '&count=' +
				options.count + '&callback=?';
		}

		return url;
	};
	isAnywherePresent = function()
	{
		// check, if @Anywhere is present
		return typeof(twttr) != 'undefined';
	};
	populateTweetFeed = function(options)
	{
		// if a tweet feed is to be displayed, construct the Twitter URL and go
		// get the JSON data
		if (options.tweetFeedDecorator)
		{
			getJSON(options, getFeedUrl(options), function(options, data)
			{
				// iterate over the list of tweets
				$.each(data.results || data, function(idx, tweet)
				{
					// optionally filter tweet then
					// decorate the tweet and append to the list
					if (options._tweetFeedElement && options.tweetFilter(tweet, options))
						$(options._tweetFeedElement).append(options.tweetDecorator(tweet, options));
				});

				if (isAnywherePresent())
				{
					// if @Anywhere is present, append Hovercards to
					// @username and profile images
					twttr.anywhere(function(T)
					{
						T(options._baseSelector + ' .jta-tweet-list').hovercards({expanded: options._tweetFeedConfig.expandHovercards});
						T(options._baseSelector + ' .jta-tweet-profile-image img').hovercards(
						{
							expanded: options._tweetFeedConfig.expandHovercards,
							username: function(node) { return node.alt; }
						});
					});
				}
			});
		}
	};
	populateAnywhereControls = function(options)
	{
		if (isAnywherePresent())
		{
			twttr.anywhere(function(T)
			{
				// optionally add an @Anywhere TweetBox
				if (options.tweetBoxDecorator)
				{
					T(options._baseSelector + ' .jta-tweet-box').tweetBox(options._tweetBoxConfig);
				}

				// optionally add an @Anywhere FollowButton
				if (options.followButtonDecorator)
				{
					T(options._baseSelector + ' .jta-follow-button').followButton(options.username);
				}

				// optionally add an @Anywhere ConnectButton
				if (options.connectButtonDecorator)
				{
					var o = $.extend(
					{
						authComplete: function(user)
						{
							// display/update login infos on connect/signin event
							updateLoginInfoElement(options, T);
						},
						signOut: function()
						{
							// display/update login infos on signout event
							updateLoginInfoElement(options, T);
						}
					}, options._connectButtonConfig);

					T(options._baseSelector + ' .jta-connect-button').connectButton(o);

					// display/update login infos
					updateLoginInfoElement(options, T);
				}
			});
		}
	};
	getJSON = function(options, url, fct)
	{
		preLoading(options);

		$.getJSON(
			url,
			function(data, textStatus)
			{
				postLoading(options);

				// in case of an error, display the error message
				if (data.error)
				{
					showError(options, data.error);
				}
				else
				{
					fct(options, data);
				}
			}
		);
	};
	preLoading = function(options)
	{
		options._loadingCount++;
	};
	postLoading = function(options)
	{
		if (--options._loadingCount <= 0)
			removeLoadingIndicator(options);
	};
	addLoadingIndicator = function(options)
	{
		if (!options._loadingIndicatorElement)
		{
			options._loadingIndicatorElement = $(options.loadingDecorator(options));
			options._baseElement.append(options._loadingIndicatorElement);
		}
	};
	removeLoadingIndicator = function(options)
	{
		if (options._loadingIndicatorElement)
		{
			options._loadingIndicatorElement.remove();
			options._loadingIndicatorElement = null;
		}
	};
    formatDate = function(dateStr)
	{
    	return dateStr.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3');
    };
	validateRange = function(num, lo, hi)
	{
		if (num < lo)
			num = lo;

		if (num > hi)
			num = hi;

		return num;
	};
    showError = function(options, errorText)
	{
    	if (options.errorDecorator)
    	{
    		$(options._baseElement).append(options.errorDecorator(errorText, options));
    	}
    };
})(jQuery);
