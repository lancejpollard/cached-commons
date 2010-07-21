$(document).ready(function() {
	alert("!")
	alert($("article").length())
	$("article ul > li").click(function() {
	  alert("clicked");
	});
	
});
