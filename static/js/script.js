var unassignedCount;
$(document).ready(function () {
    $(".attribute").tooltip({delay: {show: 2000, hide:100}});
    $(".sound_navigation a").tooltip({delay: {show: 500, hide:0}});
    unassignedCount = $(".unassigned li").size();
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    hideClickVote(ev.target.id);
    ev.dataTransfer.setData("Text",ev.target.id);
    $("#"+ev.target.id).draggable();
    document.getElementById("positive").style.backgroundColor = "#A0FFA0";
    document.getElementById("negative").style.backgroundColor = "#FF6060";
} 
function dragEnd(ev) {
    document.getElementById("positive").style.backgroundColor = "#CCCCD8";
    document.getElementById("negative").style.backgroundColor = "#CCCCD8";
    $("#"+ev.target.id).draggable("disable");
    submitReady();
}
function dropNegative(ev) {
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    document.getElementById("negative").appendChild(document.getElementById(data));
    $("li p").removeClass("invisiblehover").removeClass("visible");
}
function dropNeutral(ev) {
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    document.getElementById("unassigned").appendChild(document.getElementById(data));
    $("li p").removeClass("invisiblehover").removeClass("visible");
}
function dropPositive(ev) {
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    document.getElementById("positive").appendChild(document.getElementById(data));
    $("li p").removeClass("invisiblehover").removeClass("visible");
}
function movePositive(id) {
    document.getElementById("positive").appendChild(document.getElementById(id));
    $("li p").removeClass("invisiblehover").removeClass("visible");
    submitReady();
}
function moveNegative(id) {
    document.getElementById("negative").appendChild(document.getElementById(id));
    $("li p").removeClass("invisiblehover").removeClass("visible");
    submitReady();
}
function moveNeutral(id) {
    document.getElementById("unassigned").appendChild(document.getElementById(id));
    $("li p").removeClass("invisiblehover").removeClass("visible");
    submitReady();
}
function submitReady() {
    if ($(".unassigned li").size() < unassignedCount) {
	if (!$("#submitBtn").is(":visible")) {
	    $("#submitBtn").fadeIn("slow");
	}
    } else {
	$("#submitBtn").hide();
}
}
function showClickVote(id) {
    if ($("#unassigned #" + id + " .attName").is(":visible")) {
	$("li p").removeClass("invisiblehover").removeClass("visible");
	$("#" + id + " .clickVote").addClass("visible");
	$("#" + id + " .attName").addClass("invisiblehover").removeClass("visible");
    }
}
function showClickVote2(id) {
    if ($(".assigned #" + id + " .attStats").is(":visible") && 
	$("#"+id).attr("draggable") == "true") {
	$("li p").removeClass("invisiblehover").removeClass("visible");
	$("#" + id + " .clickVote").addClass("visible");
	$("#" + id + " .attName").addClass("invisiblehover").removeClass("visible");
	$("#" + id + " .attStats").addClass("invisiblehover");
    }
}
function hideClickVote(id) {
    if (!$("#" + id + " .attName").is(":visible")) {
	$("#" + id + " .clickVote").removeClass("visible");
	$("#" + id + " .attName").removeClass("invisiblehover");
	$("#" + id + " .attStats").removeClass("invisiblehover");
    }
}

function increaseVotes() {
    var positives = $("#positive .y");
    var negatives = $("#negative .n");
    var val;
    var data = new Object();
    var atts = $(".judgeArea li");
    for (var i = 0; i < atts.length; i++) {
	data[$(atts[i]).attr("id")] = 0;
    }
    for (var i = 0; i < positives.length; i++) {
	if ($(positives[i]).parent().parent().attr("draggable") == "true") {
	    val = parseInt($(positives[i]).html(), 10);
	    $(positives[i]).html(val+1);
	    data[$(positives[i]).parent().parent().attr("id")] = "y";
	}
    }
    for (var i = 0; i < negatives.length; i++) {
	if ($(negatives[i]).parent().parent().attr("draggable") == "true") {
	    val = parseInt($(negatives[i]).html(), 10);
	    $(negatives[i]).html(val+1);
	    data[$(negatives[i]).parent().parent().attr("id")] = "n";
	}
    }
    var items = $(".assigned li");
    for (var i = 0; i < items.length; i++) {
	$(items[i]).attr("draggable","false");
    }
    var ps = $(".assigned li p");
    for (var i = 0; i < ps.length; i++) {
	$(ps[i]).addClass("locked");
    }
    $.post(window.location, data);
}
