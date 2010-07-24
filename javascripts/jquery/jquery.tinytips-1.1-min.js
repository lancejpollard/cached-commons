/***********************************************************/
/*                    tinyTips Plugin                      */
/*                      Version: 1.1                       */
/*                      Mike Merritt                       */
/*                 Updated: Mar 2nd, 2010                  */
/***********************************************************/

(function(a){a.fn.tinyTips=function(h,b){if(h==="null"){h="light"}var d=h+"Tip";var c='<div class="'+d+'"><div class="content"></div><div class="bottom">&nbsp;</div></div>';var e=300;var f;var g;a(this).hover(function(){a("body").append(c);var k="div."+d;f=a(k);f.hide();if(b==="title"){var i=a(this).attr("title")}else{if(b!=="title"){var i=b}}a(k+" .content").html(i);g=a(this).attr("title");a(this).attr("title","");var m=f.height()+2;var j=(f.width()/2)-(a(this).width()/2);var n=a(this).offset();var l=n;l.top=n.top-m;l.left=n.left-j;f.css("position","absolute").css("z-index","1000");f.css(l).fadeIn(e)},function(){a(this).attr("title",g);f.fadeOut(e,function(){a(this).remove()})})}})(jQuery);