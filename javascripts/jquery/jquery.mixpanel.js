/*
  $.mixpanel.setup("my19491Id");
  http://mixpanel.com/api/docs/guides/integration#js
*/
var mpmetrics = null;

(function($) {
  $.mixpanel = {
    setup: function(id, options) {
      var protocol = (('https:' == document.location.protocol) ? 'https://' : 'http://');
      var url      = protocol + 'api.mixpanel.com/site_media/js/api/mixpanel.js';
      $.ajax({
        url: url,
        success: function() {
          try {
            mpmetrics = new MixpanelLib(id);
          } catch(err) {
            null_fn = function () {};
            mpmetrics = {
              track: null_fn, 
              track_funnel: null_fn,
              register: null_fn,
              register_once: null_fn,
              register_funnel: null_fn
            }
          }
        },
        dataType: "script",
        cache: true // We want the cached version
      });
    },
    track: function(event, properties, callback) {
      mpmetrics.track(event, properties, callback);
    },
    track_funnel: function(funnel, step, goal, properties, callback) {
      mpmetrics.track_funnel(funnel, step, goal, properties, callback);
    },
    register: function(properties, type, days) {
      mpmetrics.register(properties, type, days);
    },
    user: function(id) {
      mpmetrics.identify(id);
    }
  };
  
  $.metrics = function(track_attribute, options) {
    $("[" + track_attribute + "]").each(function(index, element) {
      var item = $(element);
      var key  = item.attr(track_attribute);
      var event = null;
      if (options[key]) {
        for (event in options[key]) {
          var callback = options[key][event];
          item.bind(event, function() {
            callback(key, event, item);
          });
        }
      }
    });
  }
  /*
  $.analytics = function(options) {
    options['account_id']             = 'UA-XXXXXX-X';  
    options['enable_tracker']         = true;  
    options['track_adm_pages']        = false;  
    options['ignore_users']           = true;  
    options['max_user_level']         = 8;  
    options['footer_hooked']          = false; // assume the worst
    options['filter_content']         = true;  
    options['filter_comments']        = true;  
    options['filter_comment_authors'] = true;  
    options['track_ext_links']        = true;  
    options['prefix_ext_links']       = '/outgoing/';  
    options['track_files']            = true;  
    options['prefix_file_links']      = '/downloads/';  
    options['track_extensions']       = 'gif,jpg,jpeg,bmp,png,pdf,mp3,wav,phps,zip,gz,tar,rar,jar,exe,pps,ppt,xls,doc';  
    options['track_mail_links']       = true;  
    options['prefix_mail_links']      = '/mailto/';  
    options['debug']                  = false;  
    options['check_updates']          = true;  
    options['version_sent']           = '';  
    options['advanced_config']        = false;
  }*/
})(jQuery);
