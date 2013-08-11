var voting = "positive";
$(document).ready(function () {
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
	$("a.twitter").attr("href", "https://twitter.com/share?url=" + encodeURIComponent(document.URL));
	$("a.facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(document.URL));
	$(".sharing a").click(function(event) {
        var id = $(this).attr("id");
        var site = $(this).attr("class");
        _gaq.push(['_trackEvent', 'Share', site]);
    var width  = 575, height = 400, left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
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
    $(".attribute").tooltip({delay: {show: 1200, hide:100}, trigger: "manual"});
    $(".attribute .info").hover(function(){$(this).parent().tooltip('show');},
								function(){$(this).parent().tooltip('hide');});
    $(".attribute .info").click(function(){$(this).parent().tooltip('toggle');});
    $(".attribute .stats-toggle").hover(function(e){showVotingStats(e, 'show');},
										function(e){showVotingStats(e, 'hide');});
    $(".attribute .stats-toggle").click(function(e){showVotingStats(e, 'toggle');});
    
    $("#loginModal .submit-btn").click(function(e){
        var email = $("#loginModal input.email").val();
        _gaq.push(['_trackEvent', 'Email', "Open Modal", "Navbar"]);
        $.post("/register", {email:email}, function(json){
            if (json.res == "success") {
                _gaq.push(['_trackEvent', 'Email', "Valid"]);
                $("#loginModal .response").html("<div class='alert alert-success'>Thanks! Talk to you soon.</div>");
                setTimeout(function(){$("#loginModal").modal("hide");}, 750);
            } else{
                $("#loginModal .response").html("<div class='alert alert-error'>Woops. Something wasn't right.</div>");
                _gaq.push(['_trackEvent', 'Email', "Invalid"]);
            }
        });
    });

    $(".voting a").click(function() {
    	$(".voting a.selected").removeClass("selected");
    	$(this).addClass("selected");
    	voting = $(this).attr("id");
        _gaq.push(['_trackEvent', 'Change Voting', voting]);
    	var $elements = $(".elements li."+voting);
    	$elements.css("background","#333");
    	setTimeout(function(){$elements.css("background","");},115);
    });
    $(".elements li p").click(function() {
    	var $el = $(this).parent();
        var att = $el.attr("id");
    	if ($el.hasClass(voting)) {
    	    $el.removeClass();
            _gaq.push(['_trackEvent', 'Unrate', att, voting]);
    	} else {
    	    $el.removeClass();
    	    $el.addClass(voting + " rated");
            _gaq.push(['_trackEvent', 'Rate', att, voting]);
    	}
    	countVotes();
        submitVotes(att);
    });
});
$(window).resize(function () {
	$(".more-tracks").css("top", $(".selectedSound").height() + "px");
});
var showVotingStats = function(e, option) {
    var $el = $(e.currentTarget).parent(),
    $p      = $el.find("p.attName"),
    $stats  = $el.find("div.voting-stats");
    if (option=="show") {
    	$p.animate({'opacity':0});
    	$stats.fadeIn();
    } else if (option=="hide") {
    	$p.animate({'opacity':1});
    	$stats.fadeOut();
    } else {
    	if ($p.css("opacity") == 1) {
    		showVotingStats(e, "show");
    	} else {
    		showVotingStats(e, "hide");
    	}
    }
}

var countVotes = function() {
    var val = $('.elements li.positive').length - $('.elements li.negative').length;
    if (val > 0) {
	$('.color-bg').css({'background':'rgba(58,139,232,'+String(val*0.025)+')'});
    } else if (val < 0) {
	$('.color-bg').css({'background':'rgba(217,87,76,'+String(val*-0.025)+')'});
    } else {
	$('.color-bg').css({'background':'rgba(0,0,0,0)'});
    }
}

var submitVotes = function(att) {
    var $att = $("#"+att);
    var vote = "0";
    if ($att.hasClass("positive")) {
        vote = "y";
    } else if ($att.hasClass("negative")) {
        vote = "n";
    }
    var data = {};
    data[att] = vote
    $.post(window.location, data);
}
