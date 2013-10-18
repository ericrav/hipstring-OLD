$(document).ready(function () {
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
});