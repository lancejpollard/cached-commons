/*
jQuery Fieldtag Plugin
    * Version 1.1
    * 2009-05-07 10:10:35
    * URL: http://ajaxcssblog.com/jquery/fieldtag-watermark-inputfields/
    * Description: jQuery Plugin to dynamically tag an inputfield, with a class and/or text
    * Author: Matthias Jäggli
    * Copyright: Copyright (c) 2009 Matthias Jäggli under dual MIT/GPL license.
*/

(function($){$.fn.fieldtag=function(options){var opt=$.extend({markedClass:"tagged",standardText:false},options);$(this).focus(function(){if(!this.changed){this.clear();}}).blur(function(){if(!this.changed){this.addTag();}}).keyup(function(){this.changed=($(this).val()?true:false);}).each(function(){this.title=$(this).attr("title");if($(this).val()==$(this).attr("title")){this.changed=false;}
this.clear=function(){if(!this.changed){$(this).val("").removeClass(opt.markedClass);}}
this.addTag=function(){$(this).val(opt.standardText===false?this.title:opt.standardText).addClass(opt.markedClass);}
if(this.form){this.form.tagFieldsToClear=this.form.tagFieldsToClear||[];this.form.tagFieldsToClear.push(this);if(this.form.tagFieldsAreCleared){return true;}
this.form.tagFieldsAreCleared=true;$(this.form).submit(function(){$(this.tagFieldsToClear).each(function(){this.clear();});});}}).keyup().blur();return $(this);}})(jQuery);
