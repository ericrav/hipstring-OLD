$(document).ready(function () {
	$(".attribute input").change(function() {
		if ($(this).val().length < 20) {
			$(this).removeClass("invalid");
			$(this).addClass("edited");
			$("#save_btn:disabled").removeAttr("disabled");
			$("#save_btn").html("Save Your Changes");
		} else {
			$(this).removeClass("edited");
			$(this).addClass("invalid");
			$(this).tooltip({"title":"The attribute name must be less than 20 characters."});
		}
	});
	$(".attribute textarea").change(function() {
		if ($(this).val().length < 200) {
			$(this).removeClass("invalid");
			$(this).addClass("edited");
			$("#save_btn:disabled").removeAttr("disabled");
			$("#save_btn").html("Save Your Changes");
		} else {
			$(this).removeClass("edited");
			$(this).addClass("invalid");
			$(this).tooltip({"title":"The attribute tooltip must be less than 200 characters."});
		}
	});
	$("#save_btn").click(function() {
		var data = {};
		$("input.edited").each(function() {
			console.log($(this).parent().attr("data-att") + ": " + $(this).val());
			data[$(this).parent().attr("data-att")] = $(this).val();
		});
		$("textarea.edited").each(function() {
			console.log($(this).parent().attr("data-att") + ": " + $(this).val());
			data["info"+$(this).parent().attr("data-att")] = $(this).val();
		});
		console.log(data);
		$.post(window.location, data, function(data) {
			$("#save_btn").html("Saved!");
			$("#save_btn").attr("disabled", "disabled")
		});
	});
	$(".twitter").attr("data-location", "https://twitter.com/share?url=" + encodeURIComponent(location.protocol + "//" + document.domain + "/" + $("meta[property='songURL']").attr("content")) + "&via=hipstring");
	$(".facebook").attr("data-location", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(location.protocol + "//" + document.domain + "/" + $("meta[property='songURL']").attr("content")));
	$(".sharing button").click(function(event) {
        var id = $(this).attr("id");
        var site = $(this).attr("data-medium");
        _gaq.push(['_trackEvent', 'Share', site, "Editor"]);
    var width  = 575, height = 400, left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = $(this).attr("data-location"),
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;
        window.open(url, id, opts);
        return false;
	});
});