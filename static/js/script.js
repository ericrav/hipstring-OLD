var voting = "positive";
$(document).ready(function () {
	$("a.twitter").attr("href", "https://twitter.com/share?url=" + encodeURIComponent(document.URL) + "&text=" + encodeURIComponent("Check out this track!"));
	$("a.facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(document.URL));
	$(".sharing a").click(function(event) {
    var width  = 575, height = 400, left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, "_blank", opts);

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
	$(".more-tracks h2 i").tooltip({placement: "bottom"});
    $(".attribute").tooltip({delay: {show: 1200, hide:100}, trigger: "manual"});
    $(".attribute .info").hover(function(){$(this).parent().tooltip('show');},
								function(){$(this).parent().tooltip('hide');});
    $(".attribute .info").click(function(){$(this).parent().tooltip('toggle');});
    $(".attribute .stats-toggle").hover(function(e){showVotingStats(e, 'show');},
										function(e){showVotingStats(e, 'hide');});
    $(".attribute .stats-toggle").click(function(e){showVotingStats(e, 'toggle');});
    
    $(".voting a").click(function() {
    	$(".voting a.selected").removeClass("selected");
    	$(this).addClass("selected");
    	voting = $(this).attr("id");
    	var $elements = $(".elements li."+voting);
    	$elements.css("background","#333");
    	setTimeout(function(){$elements.css("background","");},115);
    });
    $(".elements li p").click(function() {
    	var $el = $(this).parent();
        var att = $el.attr("id");
    	if ($el.hasClass(voting)) {
    	    $el.removeClass();
    	} else {
    	    $el.removeClass();
    	    $el.addClass(voting + " rated");
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
