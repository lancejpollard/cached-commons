$(document).ready(function() {
	
	// variables
	$input = $("#input");
	$output = $("#output");
	
	$("*").toggle(function() {
		$input.animate({top:"5%"});
	}, function() {
		$input.animate({top:"40%"});
		$output.slideDown();
	})
})