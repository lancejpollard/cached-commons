/**
 * Sexy.js v0.8
 * http://sexyjs.com/
 *
 * Copyright 2010, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://sexyjs.com/license
 */
(function (window, document, adapter) {

  var HOST        = location.protocol + '//' + location.hostname + (location.port !== '' ? ':' + location.port : ''),
      RESULT_DATA = '__',
      dataTypes   = ['html', 'json', 'jsonp', 'script', 'style', 'text', 'xml'],
      rurl        = /^(\w+:)?\/\/([^\/?#]+)/,
      i, n;

  /**
   * Constructs a new Sexy instance
   */
  function Sexy (cfg) {

    /**
     * Allow instantiation without new keyword
     */
    if (!(this instanceof Sexy)) {
      return new Sexy(cfg);
    }

    this.cfgs = [];
    this.setup(cfg);
  }

  Sexy.prototype = {

    setup: function (cfg) {
      this.cfg = cfg || {};
      return this;
    },

    sajax: function (cfg) {

      var cfgs     = this.cfgs,
          uid      = cfgs.length,
          prev     = cfgs[uid - 1],
          realType = cfg.dataType,
          remote   = cfg.url.indexOf('http') === 0 && cfg.url.indexOf(HOST) === -1,
          isScript = realType === 'script',
          isStyle  = realType === 'style',
          defer    = uid > 0 ? remote && (isScript || isStyle) ? true : cfg.defer : false,
          success  = cfg.success || (isScript || isStyle ? passPrevious : passData),
          error    = cfg.error || adapter.noop,
          complete = cfg.complete || adapter.noop;

      cfgs.push(adapter.extend(true, cfg, this.cfg, cfg, {

        sendAfterSend: [],
        
        /**
         * Retrieve script and style data types as text for deferred
         * evaluation to guarantee ordering. Scripts and styles are inserted
         * into the DOM immediately before the success callback is fired.
         */
        dataType: (!remote && isScript || isStyle) ? 'text' : realType,

        /**
         * Wrap the user-configured success callback with an
         * event-driven handler.
         */
        success: function (data, status) {

          /**
           * If the request is first or the previous request has completed,
           * evaluate the response data (if necessary) and execute the success
           * callback.
           */
          if (!prev || RESULT_DATA in prev) {

            /**
             * Evaluate (local) script and style dataTypes.
             */
            if (isScript && !remote) {
              adapter.globalEval(data);
            } else if (isStyle && !remote) {
              data = adapter.styleEval(data);
            }

            /**
             * Normalize the status argument for remote dataTypes which use
             * non-XHR techniques for loading.
             */
            cfg.status = remote ? 'success' : status;

            /**
             * Execute the original success callback, passing the response
             * data, the return value of the previous success callback, the
             * next configuration object, and the success status.
             */
            cfg[RESULT_DATA] = success.call(cfg, data, prev && prev[RESULT_DATA], cfgs[uid + 1], cfg.status);

            /**
             * If the next request completed before this one, fire it's 
             * success callback.
             */
            if (cfg.nextSuccess) {
              cfg.nextSuccess();
              
            /**
             * If the next request is deferred, trigger it's send method.
             */
            } else if (cfg.sendAfterSuccess) {
              cfg.sendAfterSuccess();
            }

          /**
           * If the previous request has not yet completed, bind the success
           * callback to its response arguments and attach it to the
           * nextSuccess event of the previous request.
           */
          } else {
            prev.nextSuccess = adapter.proxy(function () {
              cfg.success(data, status);
            }, cfg);
          }

        },

        error: function (xhr, status, e) {
          error.call(cfg, xhr, status, e);
        },

        complete: function (xhr, status) {
          complete.call(cfg, xhr, status);
        }
      }));


      function send () {

        var i, n;

        if (isStyle && remote) {
          adapter.getCSS(cfg.url, cfg.success);
        } else {
          adapter.ajax(cfg);
        }
        
        if (cfg.sendAfterSend.length > 0) {
          for (i = 0, n = cfg.sendAfterSend.length; i < n; ++i) {
            cfg.sendAfterSend[i]();
          }
        }
      }

      /**
       * Since requests for remote scripts and styles use direct DOM insertion
       * (via <script> and <link> tags) and execute immediatele, we defer the
       * request until after the successful response of the previous request.
       */
      if (defer) {
        prev.sendAfterSuccess = send;
        this.lastDefer = cfg;
      } else if (this.lastDefer) {
        this.lastDefer.sendAfterSend.push(send);
      } else {
        send();
      }

      return this;
    },

    bundle: function (/* url, url2, ..., fn */) {

      var args = arguments,
          fn   = adapter.isFunction(args[args.length - 1]) ? Array.prototype.pop.call(args) : passPrevious,
          i, n;

      for (i = 0, n = args.length - 1; i < n; ++i) {
        this.text(args[i], couple);
      }

      return this.text(args[i], function (data, previous, next, status) {
        var src = couple(data, previous);
        adapter.globalEval(src);
        return fn(src, previous, next, status);
      });
    }

  };

  /**
   * Implicit callbacks
   */
  function passData (data) {
    return data;
  }

  function passPrevious (data, previous) {
    return previous;
  }

  function couple (data, previous) {
    return (previous || '') + data;
  }

  /**
   * Add sexy convenience methods
   */
  function addDataTypeMethod (dataType) {
    Sexy.prototype[dataType] = function (url, defer, success) {

      if (typeof defer !== 'boolean') {
        success = defer;
        defer   = false;
      }

      var cfg = adapter.isPlainObject(url) ? url : {
        url:      url,
        defer:    defer,
        success:  success
      };

      cfg.dataType = dataType;

      return this.sajax(cfg);
    };
  }

  for (i = 0, n = dataTypes.length; i < n; ++i) {
    addDataTypeMethod(dataTypes[i]);
  }

  Sexy.prototype.js  = Sexy.prototype.script;
  Sexy.prototype.css = Sexy.prototype.style;

  /**
   * Add sexier static methods
   */
  function addStaticMethod (method) {
    Sexy[method] = function () {
      return Sexy.prototype[method].apply(new Sexy(), arguments);
    };
  }

  for (i in Sexy.prototype) {
    addStaticMethod(i);
  }

  window.Sexy = Sexy;

})(this, this.document,

/**
 * Extend jQuery with styleEval and getCSS plugins
 */  
(function (window, document, jQuery) {

  /**
   * jQuery.styleEval plugin
   * http://github.com/furf/jquery-styleEval
   *
   * Copyright 2010, Dave Furfero
   * Dual licensed under the MIT or GPL Version 2 licenses.
   */
  jQuery.styleEval = function (data) {
    var rnotwhite = /\S/;    
    if (data && rnotwhite.test(data)) {

      var head  = document.getElementsByTagName('head')[0] || document.documentElement,
          style = document.createElement('style');

      style.type = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = data;
      } else {
        style.textContent = data;
      }

      head.insertBefore(style, head.lastChild);
      
      return style;
    }
  };
  
  /**
   * jQuery.getCSS plugin
   * http://github.com/furf/jquery-getCSS
   *
   * Copyright 2010, Dave Furfero
   * Dual licensed under the MIT or GPL Version 2 licenses.
   *
   * Inspired by Julian Aubourg's Dominoes
   * http://code.google.com/p/javascript-dominoes/
   */
  var head = document.getElementsByTagName('head')[0],
      loadedCompleteRegExp = /loaded|complete/,
      callbacks = {},
      callbacksNb = 0,
      timer;

  jQuery.getCSS = function (url, options, callback) {

    if (jQuery.isFunction(options)) {
      callback = options;
      options  = {};
    }

    var link = document.createElement('link');

    link.rel   = 'stylesheet';
    link.type  = 'text/css';
    link.media = options.media || 'screen';
    link.href  = url;

    if (options.charset) {
      link.charset = options.charset;
    }

    if (options.title) {
      callback = (function (callback) {
        return function () {
          link.title = options.title;
          callback(link, "success");
        };
      })(callback);
    }

    // onreadystatechange
    if (link.readyState) {

      link.onreadystatechange = function () {
        if (loadedCompleteRegExp.test(link.readyState)) {
          link.onreadystatechange = null;
          callback(link, "success");
        }
      };

    // If onload is available, use it
    } else if (link.onload === null /* exclude Webkit => */ && link.all) {
      link.onload = function () {
        link.onload = null;
        callback(link, "success");
      };

    // In any other browser, we poll
    } else {

      callbacks[link.href] = function () {
        callback(link, "success");
      };

      if (!callbacksNb++) {
        // poll(cssPollFunction);

        timer = window.setInterval(function () {

          var callback,
              stylesheet,
              stylesheets = document.styleSheets,
              href,
              i = stylesheets.length;

          while (i--) {
            stylesheet = stylesheets[i];
            if ((href = stylesheet.href) && (callback = callbacks[href])) {
              try {
                // We store so that minifiers don't remove the code
                callback.r = stylesheet.cssRules;
                // Webkit:
                // Webkit browsers don't create the stylesheet object
                // before the link has been loaded.
                // When requesting rules for crossDomain links
                // they simply return nothing (no exception thrown)
                // Gecko:
                // NS_ERROR_DOM_INVALID_ACCESS_ERR thrown if the stylesheet is not loaded
                // If the stylesheet is loaded:
                //  * no error thrown for same-domain
                //  * NS_ERROR_DOM_SECURITY_ERR thrown for cross-domain
                throw 'SECURITY';
              } catch(e) {
                // Gecko: catch NS_ERROR_DOM_SECURITY_ERR
                // Webkit: catch SECURITY
                if (/SECURITY/.test(e)) {

                  // setTimeout(callback, 0);
                  callback(link, "success");

                  delete callbacks[href];

                  if (!--callbacksNb) {
                    timer = window.clearInterval(timer);
                  }

                }
              }
            }
          }
        }, 13);
      }
    }
    head.appendChild(link);
  };

  return jQuery;

})(this, this.document, this.jQuery ||

/**
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function (window, document, undefined) {

  var jQuery = { fn: {} },
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    trim = String.prototype.trim,
    trimLeft = /^\s+/,
    trimRight = /\s+$/,
    rnotwhite = /\S/,
    jsc = now(),
    // rscript = /<script(.|\s)*?\/script>/gi,
    // rselectTextarea = /select|textarea/i,
    // rinput = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
    jsre = /\=\?(&|$)/,
    rquery = /\?/,
    rts = /(\?|&)_=.*?(&|$)/,
    rurl = /^(\w+:)?\/\/([^\/?#]+)/,
    r20 = /%20/g;

  function now() {
    return (new Date()).getTime();
  }

  jQuery.extend = jQuery.fn.extend = function() {
    // copy reference to target object
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
      target = {};
    }

    // extend jQuery itself if only one argument is passed
    if ( length === i ) {
      target = this;
      --i;
    }

    for ( ; i < length; i++ ) {
      // Only deal with non-null/undefined values
      if ( (options = arguments[ i ]) != null ) {
        // Extend the base object
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];

          // Prevent never-ending loop
          if ( target === copy ) {
            continue;
          }

          // Recurse if we're merging object literal values or arrays
          if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
            var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
              : jQuery.isArray(copy) ? [] : {};

            // Never move original objects, clone them
            target[ name ] = jQuery.extend( deep, clone, copy );

          // Don't bring in undefined values
          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  };


  jQuery.extend({
    
    // See test/unit/core.js for details concerning isFunction.
    // Since version 1.3, DOM methods and functions like alert
    // aren't supported. They return false on IE (#2968).
    isFunction: function( obj ) {
      return toString.call(obj) === "[object Function]";
    },

    isArray: function( obj ) {
      return toString.call(obj) === "[object Array]";
    },

    isPlainObject: function( obj ) {
      // Must be an Object.
      // Because of IE, we also have to check the presence of the constructor property.
      // Make sure that DOM nodes and window objects don't pass through, as well
      if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
        return false;
      }

      // Not own constructor property must be Object
      if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.

      var key;
      for ( key in obj ) {}

      return key === undefined || hasOwn.call( obj, key );
    },

    error: function( msg ) {
      throw msg;
    },

    parseJSON: function( data ) {
      if ( typeof data !== "string" || !data ) {
        return null;
      }

      // Make sure leading/trailing whitespace is removed (IE can't handle it)
      data = jQuery.trim( data );

      // Make sure the incoming data is actual JSON
      // Logic borrowed from http://json.org/json2.js
      if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
        .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {

        // Try to use the native JSON parser first
        return window.JSON && window.JSON.parse ?
          window.JSON.parse( data ) :
          (new Function("return " + data))();

      } else {
        jQuery.error( "Invalid JSON: " + data );
      }
    },

    noop: function() {},

    // Evalulates a script in a global context
    globalEval: function( data ) {
      if ( data && rnotwhite.test(data) ) {
        // Inspired by code by Andrea Giammarchi
        // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
        var head = document.getElementsByTagName("head")[0] || document.documentElement,
          script = document.createElement("script");

        script.type = "text/javascript";

        if ( jQuery.support.scriptEval ) {
          script.appendChild( document.createTextNode( data ) );
        } else {
          script.text = data;
        }

        // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        // This arises when a base node is used (#2709).
        head.insertBefore( script, head.firstChild );
        head.removeChild( script );
      }
    },

    // args is for internal usage only
    each: function( object, callback, args ) {
      var name, i = 0,
        length = object.length,
        isObj = length === undefined || jQuery.isFunction(object);

      if ( args ) {
        if ( isObj ) {
          for ( name in object ) {
            if ( callback.apply( object[ name ], args ) === false ) {
              break;
            }
          }
        } else {
          for ( ; i < length; ) {
            if ( callback.apply( object[ i++ ], args ) === false ) {
              break;
            }
          }
        }

      // A special, fast, case for the most common use of each
      } else {
        if ( isObj ) {
          for ( name in object ) {
            if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
              break;
            }
          }
        } else {
          for ( var value = object[0];
            i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
        }
      }

      return object;
    },

    // Use native String.trim function wherever possible
    trim: trim ?
      function( text ) {
        return text == null ?
          "" :
          trim.call( text );
      } :

      // Otherwise use our own trimming functionality
      function( text ) {
        return text == null ?
          "" :
          text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
      },

    proxy: function( fn, proxy, thisObject ) {
      if ( arguments.length === 2 ) {
        if ( typeof proxy === "string" ) {
          thisObject = fn;
          fn = thisObject[ proxy ];
          proxy = undefined;

        } else if ( proxy && !jQuery.isFunction( proxy ) ) {
          thisObject = proxy;
          proxy = undefined;
        }
      }

      if ( !proxy && fn ) {
        proxy = function() {
          return fn.apply( thisObject || this, arguments );
        };
      }

      // Set the guid of unique handler to the same of original handler, so it can be removed
      if ( fn ) {
        proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
      }

      // So proxy can be declared as an argument
      return proxy;
    }
  });

  jQuery.support = { scriptEval: false };
  
  var root = document.documentElement,
    script = document.createElement("script"),
    div = document.createElement("div"),
    id = "script" + now();
  
  script.type = "text/javascript";
  try {
    script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
  } catch(e) {}

  root.insertBefore( script, root.firstChild );

  // Make sure that the execution of code works by injecting a script
  // tag with appendChild/createTextNode
  // (IE doesn't support this, fails, and uses .text instead)
  if ( window[ id ] ) {
    jQuery.support.scriptEval = true;
    delete window[ id ];
  }

  root.removeChild( script );


  jQuery.extend({

    ajaxSetup: function( settings ) {
      jQuery.extend( jQuery.ajaxSettings, settings );
    },

    ajaxSettings: {
      url: location.href,
      // global: true,
      type: "GET",
      contentType: "application/x-www-form-urlencoded",
      processData: true,
      async: true,
      /*
      timeout: 0,
      data: null,
      username: null,
      password: null,
      traditional: false,
      */
      // Create the request object; Microsoft failed to properly
      // implement the XMLHttpRequest in IE7 (can't request local files),
      // so we use the ActiveXObject when it is available
      // This function can be overriden by calling jQuery.ajaxSetup
      xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
        function() {
          return new window.XMLHttpRequest();
        } :
        function() {
          try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
          } catch(e) {}
        },
      accepts: {
        xml: "application/xml, text/xml",
        html: "text/html",
        script: "text/javascript, application/javascript",
        json: "application/json, text/javascript",
        text: "text/plain",
        _default: "*/*"
      }
    },

    ajax: function( origSettings ) {
      var s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings),
        jsonp, status, data, type = s.type.toUpperCase();

      s.context = origSettings && origSettings.context || s;

      // convert data if not already a string
      if ( s.data && s.processData && typeof s.data !== "string" ) {
        s.data = jQuery.param( s.data, s.traditional );
      }

      // Handle JSONP Parameter Callbacks
      if ( s.dataType === "jsonp" ) {
        if ( type === "GET" ) {
          if ( !jsre.test( s.url ) ) {
            s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
          }
        } else if ( !s.data || !jsre.test(s.data) ) {
          s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
        }
        s.dataType = "json";
      }

      // Build temporary JSONP function
      if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
        jsonp = s.jsonpCallback || ("jsonp" + jsc++);

        // Replace the =? sequence both in the query string and the data
        if ( s.data ) {
          s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
        }

        s.url = s.url.replace(jsre, "=" + jsonp + "$1");

        // We need to make sure
        // that a JSONP style response is executed properly
        s.dataType = "script";

        // Handle JSONP-style loading
        window[ jsonp ] = window[ jsonp ] || function( tmp ) {
          data = tmp;
          jQuery.ajax.handleSuccess( s, xhr, status, data );
          jQuery.ajax.handleComplete( s, xhr, status, data );
          // Garbage collect
          window[ jsonp ] = undefined;

          try {
            delete window[ jsonp ];
          } catch( jsonpError ) {}

          if ( head ) {
            head.removeChild( script );
          }
        };
      }

      if ( s.dataType === "script" && s.cache === null ) {
        s.cache = false;
      }

      if ( s.cache === false && type === "GET" ) {
        var ts = now();

        // try replacing _= if it is there
        var ret = s.url.replace(rts, "$1_=" + ts + "$2");

        // if nothing was replaced, add timestamp to the end
        s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
      }

      // If data is available, append data to url for get requests
      if ( s.data && type === "GET" ) {
        s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
      }

      // // Watch for a new set of requests
      // if ( s.global && jQuery.ajax.active++ === 0 ) {
      //  jQuery.event.trigger( "ajaxStart" );
      // }

      // Matches an absolute URL, and saves the domain
      var parts = rurl.exec( s.url ),
        remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

      // If we're requesting a remote document
      // and trying to load JSON or Script with a GET
      if ( s.dataType === "script" && type === "GET" && remote ) {
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        var script = document.createElement("script");
        script.src = s.url;
        if ( s.scriptCharset ) {
          script.charset = s.scriptCharset;
        }

        // Handle Script loading
        if ( !jsonp ) {
          var done = false;

          // Attach handlers for all browsers
          script.onload = script.onreadystatechange = function() {
            if ( !done && (!this.readyState ||
                this.readyState === "loaded" || this.readyState === "complete") ) {
              done = true;
              jQuery.ajax.handleSuccess( s, xhr, status, data );
              jQuery.ajax.handleComplete( s, xhr, status, data );

              // Handle memory leak in IE
              script.onload = script.onreadystatechange = null;
              if ( head && script.parentNode ) {
                head.removeChild( script );
              }
            }
          };
        }

        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        // This arises when a base node is used (#2709 and #4378).
        head.insertBefore( script, head.firstChild );

        // We handle everything using the script element injection
        return undefined;
      }

      var requestDone = false;

      // Create the request object
      var xhr = s.xhr();

      if ( !xhr ) {
        return;
      }

      // Open the socket
      // Passing null username, generates a login popup on Opera (#2865)
      if ( s.username ) {
        xhr.open(type, s.url, s.async, s.username, s.password);
      } else {
        xhr.open(type, s.url, s.async);
      }

      // Need an extra try/catch for cross domain requests in Firefox 3
      try {
        // Set the correct header, if data is being sent
        if ( s.data || origSettings && origSettings.contentType ) {
          xhr.setRequestHeader("Content-Type", s.contentType);
        }

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {
          if ( jQuery.lastModified[s.url] ) {
            xhr.setRequestHeader("If-Modified-Since", jQuery.lastModified[s.url]);
          }

          if ( jQuery.ajax.etag[s.url] ) {
            xhr.setRequestHeader("If-None-Match", jQuery.ajax.etag[s.url]);
          }
        }

        // Set header so the called script knows that it's an XMLHttpRequest
        // Only send the header if it's not a remote XHR
        if ( !remote ) {
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        }

        // Set the Accepts header for the server, depending on the dataType
        xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
          s.accepts[ s.dataType ] + ", */*" :
          s.accepts._default );
      } catch( headerError ) {}

      // Allow custom headers/mimetypes and early abort
      if ( s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false ) {
        // // Handle the global AJAX counter
        // if ( s.global && jQuery.ajax.active-- === 1 ) {
        //  jQuery.event.trigger( "ajaxStop" );
        // }

        // close opended socket
        xhr.abort();
        return false;
      }

      // if ( s.global ) {
      //  jQuery.ajax.triggerGlobal( s, "ajaxSend", [xhr, s] );
      // }

      // Wait for a response to come back
      var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {
        // The request was aborted
        if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
          // Opera doesn't call onreadystatechange before this point
          // so we simulate the call
          if ( !requestDone ) {
            jQuery.ajax.handleComplete( s, xhr, status, data );
          }

          requestDone = true;
          if ( xhr ) {
            xhr.onreadystatechange = jQuery.noop;
          }

        // The transfer is complete and the data is available, or the request timed out
        } else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
          requestDone = true;
          xhr.onreadystatechange = jQuery.noop;

          status = isTimeout === "timeout" ?
            "timeout" :
            !jQuery.ajax.httpSuccess( xhr ) ?
              "error" :
              s.ifModified && jQuery.ajax.httpNotModified( xhr, s.url ) ?
                "notmodified" :
                "success";

          var errMsg;

          if ( status === "success" ) {
            // Watch for, and catch, XML document parse errors
            try {
              // process the data (runs the xml through httpData regardless of callback)
              data = jQuery.ajax.httpData( xhr, s.dataType, s );
            } catch( parserError ) {
              status = "parsererror";
              errMsg = parserError;
            }
          }

          // Make sure that the request was successful or notmodified
          if ( status === "success" || status === "notmodified" ) {
            // JSONP handles its own success callback
            if ( !jsonp ) {
              jQuery.ajax.handleSuccess( s, xhr, status, data );
            }
          } else {
            jQuery.ajax.handleError( s, xhr, status, errMsg );
          }

          // Fire the complete handlers
          jQuery.ajax.handleComplete( s, xhr, status, data );

          if ( isTimeout === "timeout" ) {
            xhr.abort();
          }

          // Stop memory leaks
          if ( s.async ) {
            xhr = null;
          }
        }
      };

      // Override the abort handler, if we can (IE doesn't allow it, but that's OK)
      // Opera doesn't fire onreadystatechange at all on abort
      try {
        var oldAbort = xhr.abort;
        xhr.abort = function() {
          if ( xhr ) {
            oldAbort.call( xhr );
          }

          onreadystatechange( "abort" );
        };
      } catch( abortError ) {}

      // Timeout checker
      if ( s.async && s.timeout > 0 ) {
        setTimeout(function() {
          // Check to see if the request is still happening
          if ( xhr && !requestDone ) {
            onreadystatechange( "timeout" );
          }
        }, s.timeout);
      }

      // Send the data
      try {
        xhr.send( type === "POST" || type === "PUT" || type === "DELETE" ? s.data : null );

      } catch( e ) {
        jQuery.ajax.handleError( s, xhr, null, e );

        // Fire the complete handlers
        jQuery.ajax.handleComplete( s, xhr, status, data );
      }

      // firefox 1.5 doesn't fire statechange for sync requests
      if ( !s.async ) {
        onreadystatechange();
      }

      // return XMLHttpRequest to allow aborting the request etc.
      return xhr;
    },

    // Serialize an array of form elements or a set of
    // key/values into a query string
    param: function( a, traditional ) {
      var s = [], add = function( key, value ) {
        // If value is a function, invoke it and return its value
        value = jQuery.isFunction(value) ? value() : value;
        s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
      };

      // Set traditional to true for jQuery <= 1.3.2 behavior.
      if ( traditional === undefined ) {
        traditional = jQuery.ajaxSettings.traditional;
      }

      // If an array was passed in, assume that it is an array of form elements.
      if ( jQuery.isArray(a) || a.jquery ) {
        // Serialize the form elements
        jQuery.each( a, function() {
          add( this.name, this.value );
        });

      } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for ( var prefix in a ) {
          buildParams( prefix, a[prefix], traditional, add );
        }
      }

      // Return the resulting serialization
      return s.join("&").replace(r20, "+");
    }
  });

  function buildParams( prefix, obj, traditional, add ) {
    if ( jQuery.isArray(obj) ) {
      // Serialize array item.
      jQuery.each( obj, function( i, v ) {
        if ( traditional || /\[\]$/.test( prefix ) ) {
          // Treat each array item as a scalar.
          add( prefix, v );

        } else {
          // If array item is non-scalar (array or object), encode its
          // numeric index to resolve deserialization ambiguity issues.
          // Note that rack (as of 1.0.0) can't currently deserialize
          // nested arrays properly, and attempting to do so may cause
          // a server error. Possible fixes are to modify rack's
          // deserialization algorithm or to provide an option or flag
          // to force array serialization to be shallow.
          buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
        }
      });

    } else if ( !traditional && obj != null && typeof obj === "object" ) {
      // Serialize object item.
      jQuery.each( obj, function( k, v ) {
        buildParams( prefix + "[" + k + "]", v, traditional, add );
      });

    } else {
      // Serialize scalar item.
      add( prefix, obj );
    }
  }

  jQuery.extend( jQuery.ajax, {

    // Counter for holding the number of active queries
    active: 0,

    // Last-Modified header cache for next request
    lastModified: {},
    etag: {},

    handleError: function( s, xhr, status, e ) {
      // If a local callback was specified, fire it
      if ( s.error ) {
        s.error.call( s.context, xhr, status, e );
      }

      // // Fire the global callback
      // if ( s.global ) {
      //  jQuery.ajax.triggerGlobal( s, "ajaxError", [xhr, s, e] );
      // }
    },

    handleSuccess: function( s, xhr, status, data ) {
      // If a local callback was specified, fire it and pass it the data
      if ( s.success ) {
        s.success.call( s.context, data, status, xhr );
      }

      // // Fire the global callback
      // if ( s.global ) {
      //  jQuery.ajax.triggerGlobal( s, "ajaxSuccess", [xhr, s] );
      // }
    },

    handleComplete: function( s, xhr, status ) {
      // Process result
      if ( s.complete ) {
        s.complete.call( s.context, xhr, status );
      }

      // // The request was completed
      // if ( s.global ) {
      //  jQuery.ajax.triggerGlobal( s, "ajaxComplete", [xhr, s] );
      // }

      // // Handle the global AJAX counter
      // if ( s.global && jQuery.ajax.active-- === 1 ) {
      //  jQuery.event.trigger( "ajaxStop" );
      // }
    },

    // triggerGlobal: function( s, type, args ) {
    //  (s.context && s.context.url == null ? jQuery(s.context) : jQuery.event).trigger(type, args);
    // },

    // Determines if an XMLHttpRequest was successful or not
    httpSuccess: function( xhr ) {
      try {
        // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
        return !xhr.status && location.protocol === "file:" ||
          // Opera returns 0 when status is 304
          ( xhr.status >= 200 && xhr.status < 300 ) ||
          xhr.status === 304 || xhr.status === 1223 || xhr.status === 0;
      } catch(e) {}

      return false;
    },

    // Determines if an XMLHttpRequest returns NotModified
    httpNotModified: function( xhr, url ) {
      var lastModified = xhr.getResponseHeader("Last-Modified"),
        etag = xhr.getResponseHeader("Etag");

      if ( lastModified ) {
        jQuery.ajax.lastModified[url] = lastModified;
      }

      if ( etag ) {
        jQuery.ajax.etag[url] = etag;
      }

      // Opera returns 0 when status is 304
      return xhr.status === 304 || xhr.status === 0;
    },

    httpData: function( xhr, type, s ) {
      var ct = xhr.getResponseHeader("content-type") || "",
        xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
        data = xml ? xhr.responseXML : xhr.responseText;

      if ( xml && data.documentElement.nodeName === "parsererror" ) {
        jQuery.error( "parsererror" );
      }

      // Allow a pre-filtering function to sanitize the response
      // s is checked to keep backwards compatibility
      if ( s && s.dataFilter ) {
        data = s.dataFilter( data, type );
      }

      // The filter can actually parse the response
      if ( typeof data === "string" ) {
        // Get the JavaScript object, if JSON is used.
        if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
          data = jQuery.parseJSON( data );

        // If the type is "script", eval it in global context
        } else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
          jQuery.globalEval( data );
        }
      }

      return data;
    }

  });

  // For backwards compatibility
  jQuery.extend( jQuery.ajax );

  return jQuery;

})(this, this.document)));