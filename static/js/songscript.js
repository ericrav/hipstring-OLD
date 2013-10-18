$(document).ready(function () {
    $atts = $(".attribute");
    for (var i=0; i<$atts.length; i++) {
        if ($($atts[i]).hasClass("rated")) {
            $($atts[i]).find(".positive > .count").text(document.votingValues[i][0]);
            $($atts[i]).find(".negative > .count").text(document.votingValues[i][1]);
        }
    }
    $.get("/user/stats/", function(stats){
        var total  = stats.total;
        var voted  = stats.voted;
        var plural = parseInt(total) == 1 ? "" : "s";
        // $(".more-tracks").prepend("<div><h2><i class='icon-user'></i></h2><p class='stats'>You have listened to "
                                  // + total + " song" + plural + " and rated " + voted + " of them.</div>");
    });
    $.get("/songs/random/", function(songData){
        moreTracksHtml = "";
        for (var i = 0; i < songData.length; i++) {
            var votedClass = "";
            if (songData[i].voted == -1) {
                votedClass = "unheard";
            } else {
                votedClass = "ur" + songData[i].voted;
            }
            moreTracksHtml += '<div class="track '+votedClass+'"><div class="cover-container"><a href="/'+songData[i].url+'"><img src="'+songData[i].artwork+'"></a></div><span class="title" title="'+songData[i].title+'">'+songData[i].title+'</span><span class="artist" title="'+songData[i].author+'">'+songData[i].author+'</span></div>';
        }
        $(".more-tracks .tracks-container").html(moreTracksHtml);
    });
	$(".twitter").attr("data-location", "https://twitter.com/share?url=" + encodeURIComponent(document.URL));
	$(".facebook").attr("data-location", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(document.URL));
	$(".sharing button").click(function(event) {
        var id = $(this).attr("id");
        var site = $(this).attr("data-medium");
        _gaq.push(['_trackEvent', 'Share', site]);
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
	$(".more-tracks").css("top", $(".selectedSound").height() + "px");
	var votingStats = document.votingValues;
	var $elements = $(".attribute");
	for (var i = 0; i < $elements.length; i++) {
		var p     = votingStats[i][0]; 
		var n     = votingStats[i][1]; 
		var total = (p + n) == 0 ? 1 : p + n;
		var $el   = $($elements[i]);
		$el.find(".voting-stats .positive .bar").css("width", (((p/total)*65)+5) + "%");
		$el.find(".voting-stats .negative .bar").css("width", (((n/total)*65)+5) + "%");
		$el.find(".voting-stats .positive span").text(p);
		$el.find(".voting-stats .negative span").text(n);
	}
    $(".navbar .newsong").tooltip({placement: "bottom"});
	$(".more-tracks h2 i").tooltip({placement: "bottom"});
    $(".attribute .info").tooltip({delay: {show: 1200, hide:100}, trigger: "manual"});
    $(".attribute .info").hover(function(){$(this).tooltip('show');},
								function(){$(this).tooltip('hide');});
    $(".attribute .info").click(function(){$(this).tooltip('toggle');});
    
    $("#loginModal .submit-btn").click(function(e){
        var email = $("#loginModal input.email").val();
        _gaq.push(['_trackEvent', 'Email', "Open Modal", "Navbar"]);
        $.post("/register", {email:email}, function(json){
            if (json.res == "success") {
                _gaq.push(['_trackEvent', 'Email', "Valid"]);
                $("#loginModal .response").html("<div class='alert alert-success'>Thanks! Talk to you soon.</div>");
                setTimeout(function(){$("#loginModal").modal("hide");}, 750);
            } else{
                $("#loginModal .response").html("<div class='alert alert-danger'>Woops. Something wasn't right.</div>");
                _gaq.push(['_trackEvent', 'Email', "Invalid"]);
            }
        });
    });

    $(".attribute .voting .vote").click(function() {
        var vote = $(this).attr("data-value");
    	var $el = $(this).parent().parent();
        var att = parseInt($el.attr("data-att"));
        var attName = $el.find("h2").text();
    	if ($el.hasClass(vote)) {
            if (vote == "positive") document.votingValues[att][0]--;
            else document.votingValues[att][1]--;
    	    $el.removeClass();
            $el.addClass("attribute");
            $el.find(".positive > .count").text("");
            $el.find(".negative > .count").text("");
            vote = "none";
            _gaq.push(['_trackEvent', 'Unrate', attName, vote, att]);
    	} else {
            if ($el.hasClass("rated")) var rated = true;
            if (vote == "positive") {
                document.votingValues[att][0]++;
                if (rated) document.votingValues[att][1]--;
            } else {
                document.votingValues[att][1]++;
                if (rated) document.votingValues[att][0]--;
            }
    	    $el.removeClass();
    	    $el.addClass(vote + " rated attribute");
            $el.find(".positive > .count").text(document.votingValues[att][0]);
            $el.find(".negative > .count").text(document.votingValues[att][1]);
            _gaq.push(['_trackEvent', 'Rate', attName, vote, att]);
    	}
        submitVotes(att, vote);
    });
});
// $(window).resize(function () {
// 	$(".more-tracks").css("top", $(".selectedSound").height() + "px");
// });
// var showVotingStats = function(e, option) {
//     var $el = $(e.currentTarget).parent(),
//     $p      = $el.find("p.attName"),
//     $stats  = $el.find("div.voting-stats");
//     if (option=="show") {
//     	$p.animate({'opacity':0});
//     	$stats.fadeIn();
//     } else if (option=="hide") {
//     	$p.animate({'opacity':1});
//     	$stats.fadeOut();
//     } else {
//     	if ($p.css("opacity") == 1) {
//     		showVotingStats(e, "show");
//     	} else {
//     		showVotingStats(e, "hide");
//     	}
//     }
// }

var submitVotes = function(att, vote) {
    if (vote == "positive") {
        vote = "y";
    } else if (vote == "negative") {
        vote = "n";
    } else {
        vote = "0";
    }
    var data = {};
    data["att"] = att;
    data["vote"] = vote;
    $.post(window.location, data);
}

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