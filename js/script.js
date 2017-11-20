var prevState = "";
var curState = "1a";
var accountNumber = "65342";
var passcode = "1234";
var errorTime = 0;

function nextState(s, time=400){
	$("#"+curState).hide();

	if (s == "3a") {
		$(".error-time").html(3 - errorTime);
		// if errorTime
	}

	if (time > 0) {
		$("#wait").show();
	}
	setTimeout(function(){
		$("#wait").hide();
		$("#"+s).show();
		prevState = curState;
		curState = s;
	}, time);

}

$(document).ready(function() {
	$("#1a").show();
});

$(document).on('click', '#homeBtn', function(event) {
	event.preventDefault();
	// TODO: need to eject card at certain state
	nextState("1a");
});

$(document).on('click', '#backBtn', function(event) {
	event.preventDefault();
	// TODO: need to eject card at certain state
	if (curState == "2c" || curState == "4a") { prevState = "2a"}
	nextState(prevState);
});

$(document).on('click', '#1a', function(event) {
	console.log(event);
	console.log(event.target.tagName)
	if ($.inArray(event.target.tagName, ["SELECT", "OPTION"]) > -1) {return};
	nextState("2a", 0);
	$("#homeBtn").show();
});

$(document).on('click', '#insert-card', function(event) {
	nextState("2b", 0);
	$("#backBtn").show();
});

$(document).on('click', '#enter-account-number', function(event) {
	nextState("2c", 0);
	$("#backBtn").show();
});

$(document).on('click', '#swipe-card', function(event) {
	nextState("2d", 0);
	$("#backBtn").show();
});

$(document).on('click', '.input-password', function(event) {
	event.preventDefault();
	if (curState == "2c"){ // entered account number
		if($("#account-number").val() != accountNumber){
			errorTime += 1
			if (errorTime >= 3) {
				nextState("3b");
				$("#backBtn").hide();
				return;
			}
			nextState("3a");
			return;
		}
	}

	nextState("4a");
});

$(document).on('click', '.log-in', function(event) {
	event.preventDefault();
	console.log($("#passcode").val())
	if ($("#passcode").val() == passcode){
		nextState("5a");
	}else{
		errorTime += 1;
		if (errorTime >= 3) {
			nextState("3b");
			$("#backBtn").hide();
			return;
		}
		nextState("3a")
	}
});

