$(document).ready(function () {
	var helpTimer = setInterval(function(){
		if ($("#elements .rated").length > 0){
			clearInterval(helpTimer);
			return;
		}
		$(".voting .selected").popover({"placement": "bottom", "title": "Your Selection", "trigger": "manual",
							 "content": "This highlighted box is the current category you're voting in. Clicking the elements below will then indicate your feelings corresponding to this selection."});
		$(".voting .selected").popover("show");
		$("#elements").popover({"placement": "top", "title": "Aspects of the music to give feedback on.", "trigger": "manual",
								"content": "Clicking each aspect will indicate your feelings towards it based on the voting category selected above. Go ahead, try it!"});
		setTimeout(function(){
			$(".voting .selected").popover("hide");
			$("#elements").popover("show");
			setTimeout(function(){
				$("#elements").popover("hide");
			}, 9000);
		}, 5000);
	}, 40000);
});