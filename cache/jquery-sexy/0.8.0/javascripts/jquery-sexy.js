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

})(this, this.document, this.jQuery));