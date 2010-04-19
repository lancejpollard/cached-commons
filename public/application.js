$(document).ready(function() {	
	// variables
	$input 				= $("#input");
	$output 			= $("#output");
	$minify_form 	= $("form");
	$output_text 	= $("#output_text");
	$loader 			= $("#loader");
	$content			= $("#content");
	
//	$('input[type=checkbox], input[type=radio]').prettyCheckboxes();
	
	$('html, body').animate({opacity:1});
	$("#main").delay(500).animate({opacity:1});
	
	$minify_form.ajaxForm({
		beforeSubmit: function(arr, $form, options) {
			$loader.slideDown();
			$output.animate({opacity:0});
		},
		success: function(responseText, statusText, xhr, $form) {
			updateForm(responseText.toString());
		},
		error: function(responseText, statusText, xhr, $form) {
			updateForm(responseText.toString());
		}
	});
});

function updateForm(data) {
	$loader.slideUp();
	$input.animate({top:"4%"});
	$output.delay(300).animate({opacity:1}, function() {
		$output_text.val(data);
	});
}