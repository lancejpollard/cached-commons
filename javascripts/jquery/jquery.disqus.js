/**
 * jQuery Disqus Plugin
 * ====================
 *
 * $Id: jquery.disqus.js,v 1.1.2.5 2009/07/20 16:35:11 robloach Exp $
 *
 * Copyright (c) 2009 Rob Loach (http://robloach.net)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */

/*
 * Usage
 * -----
 *
 * Display all the comments for an article:
 * <div id="disqus_thread"><a href="http://MYDOMAINNAME.disqus.com/?url=ref">Discuss this topic on Disqus.</a></div>
 *
 * $('#disqus_thread').disqus({
 *   domain: 'MYDOMAINNAME', // REQUIRED
 *   title: 'The title of the article', 
 *   message: 'A short description of the article.'
 *   url: 'http://example.com/myarticle.html',
 *   developer: 1 // 0 if production.
 * });
 *
 * Display the number of comments in a link:
 * <a href="/myarticle.html#disqus_thread">Comments</a>
 *
 * $.disqusLinks('MYDOMAINNAME');
 */
(function(jQuery) {
  /**
   * Displays the comments for an article in the given element.
   *
   * <div id="disqus_thread"><a href="http://MYDOMAINNAME.disqus.com/?url=ref">Discuss this topic on Disqus.</a></div>
   *
   * $('#disqus_thread').disqus({
   *   domain: 'MYDOMAINNAME', // REQUIRED
   *   title: 'The title of the article', 
   *   message: 'A short description of the article.'
   *   url: 'http://example.com/myarticle.html',
   *   developer: 1 // 0 if production.
   * });
   */
  jQuery.fn.disqus = function(options) {
    
    // Merge in the default options.
    var options = jQuery.extend({
      domain: '',
      title: '',
      message: '',
      url: window.location.href,
      developer: 0,
      no_style: false
    }, options);

    // Set the options for Disqus and prepare the element.
    window.disqus_no_style = options.no_style; // document.write causes a whitescreen so prevent it.
    // var disqus_iframe_css = "http://www.my-blog-url.com/disqus-form.css";
    disqus_developer = options.developer;
    disqus_container_id = this.attr('id');
    disqus_url = options.url;
    disqus_title = options.title;
    disqus_message = options.message;
    this.empty();
    
    // Make the AJAX call to Disqus for the comments.
    jQuery.ajax({
      type: 'GET',
      url: 'http://martini.disqus.com/embed.js',
      dataType: 'script',
      cache: true
    });
  };
  /**
   * Processes the comment links.
   *
   * <a href="http://example.com/myarticle.html#disqus_thread">Comments</a>
   *
   * $.disqusLinks('MYDOMAINNAME');
   */
  jQuery.disqusLinks = function(domain) {
    // Create the query.
    var query = '?';
    jQuery("a[href$='#disqus_thread']").each(function(i) {
      query += 'url' + i + '=' + encodeURIComponent($(this).attr('href')) + '&';
    });
    
    // Make sure we are actually processing some links.
    if (query.length > 2) {
      // Make the AJAX call to get the number of comments.
      jQuery.ajax({
        type: 'GET',
        url: 'http://disqus.com/forums/' + domain + '/get_num_replies.js' + query,
        dataType: 'script',
        cache: true
      });
    }
  };
})(jQuery);