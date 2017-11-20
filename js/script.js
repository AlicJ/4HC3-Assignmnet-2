var prevState = "";
var curState = "begin-1a";
var accountNumber = "65342";
var passcode = "1234";
var errorTime = 0;

function nextState(s, time=400){
	$("#"+curState).hide();

	if (s == "error-3a") {
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
	$("#begin-1a").show();
});

$(document).on('click', '#homeBtn', function(event) {
	event.preventDefault();
	// TODO: need to eject card at certain state
	nextState("begin-1a");
});

$(document).on('click', '#backBtn', function(event) {
	event.preventDefault();
	// TODO: need to eject card at certain state
	if (curState == "account-number-2c" || curState == "passcode-4a") { prevState = "signin-2a"}
	nextState(prevState);
});

$(document).on('click', '#begin-1a', function(event) {
	console.log(event);
	console.log(event.target.tagName)
	if ($.inArray(event.target.tagName, ["SELECT", "OPTION"]) > -1) {return};
	nextState("signin-2a", 0);
	$("#homeBtn").show();
});

$(document).on('click', '.insert-card', function(event) {
	nextState("insert-2b", 0);
	$("#backBtn").show();
});

$(document).on('click', '.enter-account-number', function(event) {
	nextState("account-number-2c", 0);
	$("#backBtn").show();
});

$(document).on('click', '.swipe-card', function(event) {
	nextState("swipe-2d", 0);
	$("#backBtn").show();
});

$(document).on('click', '.input-passcode', function(event) {
	event.preventDefault();
	if (curState == "account-number-2c"){ // entered account number
		if($("#account-number").val() != accountNumber){
			errorTime += 1
			if (errorTime >= 3) {
				nextState("max-error-3b");
				$("#backBtn").hide();
				return;
			}
			nextState("error-3a");
			return;
		}
	}

	nextState("passcode-4a");
});

$(document).on('click', '.log-in', function(event) {
	event.preventDefault();
	console.log($("#passcode").val())
	if ($("#passcode").val() == passcode){
		nextState("main-5a");
	}else{
		errorTime += 1;
		if (errorTime >= 3) {
			nextState("max-error-3b");
			$("#backBtn").hide();
			return;
		}
		nextState("error-3a")
	}
});

