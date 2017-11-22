var prevState = "";
// var curState = "begin-1a";
var curState = "main-5a";
var logOutTimeout;

var inputAccountNumber;
var amountToTransfer;
var accountToTransfer;
var MAX_ACCOUNT_NUMBER = 9999999999;
var MIN_ACCOUNT_NUMBER = 1000000000;
var MAX_PASSCODE_LENGTH = 4;
var MAX_ACCOUNT_NUMBER_LENGTH = 10;

var insertCardOverwrite = false; //Used in case user inserts card on not the regular screen

var account = {
	accountNumber: 1234567890,
	passcode: 1234,
	balance: 1255,
	history: [
		{
			action: "Deposit",
			amount: 1255,
			date: 1503831131922
		}
	],
	errorTime: 0
}

function nextState(s, time=200){
	var page = s;

	$("."+curState).hide();

	if (s == "error-3a") {
		$(".error-time").html(3 - account.errorTime);
	}

	if (time > 0) {
		$(".wait").show();
	}

	setTimeout(function(){
		$(".wait").hide();
		$("."+s).show();
		prevState = curState;
		curState = s;

		switch (curState) {
			case "main-5a":
				updateAccountBalance(0);
				updateAccountNumber(account.accountNumber);
				break;
		}

	}, time);

}

function askReceipt(){
	// display "do you want receipt screen"
	// yes -> print receipt, call askMoreService
	// no -> call askMoreService
}

function askMoreService(){
	// display "do you want to perform another action"
	// yes "go back to main-5a"
	// no -> exit, show thank you screen
}

function getInputInt(selector) {
	var input = parseInt($(selector).val());
	$(selector).val("");
		console.log(input)

	if (input <= 0 || isNaN(input)) {
		return -1;
	}
	return input;
}

function isAccountLocked(){
	return account.errorTime >= 3;
}

function updateAccountBalance(action=null, amount, transferAccount=0) {
	if (action) {
		if (action == "Deposit"){
			account.balance += amount;
		}else {
			account.balance -= amount;
		}
		if (action == "Transfer") {
			action += " to Account " + transferAccount;
		}
		updateAccountHistory(action, amount, new Date());
		saveAccount();
	}
	$(".account-balance").html(formatCurrency(account.balance));
}

function updateAccountNumber(number) {
	$(".account-number").html(number);
}

function updateAccountHistory(action, amount, date) {
	account.history.push({"action": action, "amount": amount, "date": date})
}

function formatCurrency(amount){
	return '$' + parseFloat(amount, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
}

function saveAccount(){
	localStorage.setItem("account", JSON.stringify(account));
}

function loadAccount(){
	var temp = localStorage.getItem("account");
	if (temp == null) {
		saveAccount();
	} else{
		account = JSON.parse(temp)
	}
}

$(document).ready(function() {
	nextState(curState, 0)
	loadAccount();
});

$(document).on('click', '.homeBtn', function(event) {
	event.preventDefault();
	$("input").val("");
	// TODO: need to eject card at certain state
	var l = curState.split("-");
	var n = parseInt(l[l.length - 1]);
	if (n < 5 || n == 17) {
		clearInterval(logOutTimeout);
		nextState("begin-1a", 0);
	}else {
		nextState("main-5a", 0);
	}
});

$(document).on('click', '.backBtn', function(event) {
	event.preventDefault();
	$("input").val("");
	// TODO: need to eject card at certain state
	if ($.inArray(curState, ["account-number-2c",
							 "passcode-4a"]) >= 0) { prevState = "signin-2a";}
	if ($.inArray(curState, ["account-balance-15a",
							 "withdraw-amount-6a",
							 "deposit-amount-10a",
							 "transfer-amount-11a"]) >= 0) { prevState = "main-5a";}
	if($.inArray(curState, ['transfer-success-14a']) >= 0){ prevState = "transfer-amount-11a";}
	nextState(prevState);
});

$(document).on('click', '#swipe-card', function(event) {
	if (curState == "insert-2b" || curState == "begin-1a" || curState == "signin-2a" || curState == 'swipe-2d' || curState == "account-number-2c") {
		if (isAccountLocked()) {
			nextState("max-error-3b");
		}else{
			inputAccountNumber = account.accountNumber;
			nextState("passcode-4a");
		}
	} else {
		// display error
	}
});

$(document).on('click', '#insert-card', function(event) {
	if (curState == "insert-2b" || curState == "begin-1a" || curState == "signin-2a" || curState == 'swipe-2d' || curState == "account-number-2c") {
		if (isAccountLocked()) {
			nextState("max-error-3b");
		}else{
			inputAccountNumber = account.accountNumber;
			insertCardOverwrite = true;
			nextState("passcode-4a");
		}
	} else {
		// display error
	}
});

$(document).on('click', '#take-card', function(event) {
	if (curState == "login-success-4b") {
		nextState("main-5a", 0);
	}
});

$(document).on('click', '#put-money', function(event) {

});

$(document).on('click', '#take-money', function(event) {
	if (curState == "withdraw-success-7b") {
		nextState("main-5a");
	}
});

$(document).on('click', '#unlock-account', function(event) {
	if(isAccountLocked()){
		event.preventDefault();
		account.errorTime = 0;
		nextState("begin-1a");
	} else{
		console.log("You went to the clerk but they couldn't help you because your account was not locked.");
	}
});


$(document).on('click', '.begin-1a', function(event) {
	console.log(event);
	console.log(event.target.className)
	if (event.target.className.indexOf("langBtn") >= 0) {return};
	nextState("signin-2a", 0);
	$(".homeBtn").show();
});

$(document).on('click', '.langBtn', function(event) {
	event.preventDefault();
	$(".langBtn").removeClass('active');
	$(this).addClass('active');
});

$(document).on('click', '.to-insert-card', function(event) {
	nextState("insert-2b", 0);
});

$(document).on('click', '.to-enter-account-number', function(event) {
	nextState("account-number-2c", 0);
});

$(document).on('click', '.to-swipe-card', function(event) {
	nextState("swipe-2d", 0);
});

$(document).on('click', '.input-account-number', function(event) {
	event.preventDefault();
	var input = getInputInt("#account-number");
	if (input < 0) {return;}

	if(input != account.accountNumber){
		// account.errorTime += 1
		// if (account.errorTime >= 3) {
		// 	nextState("max-error-3b");
		// 	$(".backBtn").hide();
		// 	return;
		// }
		nextState("account-error-3c");
		return;
	}

	if (input > MAX_ACCOUNT_NUMBER || input < MIN_ACCOUNT_NUMBER) {
		nextState("account-error-3c");
	} else {
		inputAccountNumber = input;
	}

	if (isAccountLocked()) {
		nextState("max-error-3b");
	}else{
		nextState("passcode-4a");
	}
});

$(document).on('click', '.log-in', function(event) {
	event.preventDefault();
	var input = getInputInt("#passcode");
	if (input < 0) {return;}

	$("#passcode").val("")
	if (inputAccountNumber == account.accountNumber && input == account.passcode){
		account.errorTime = 0;
		if (insertCardOverwrite) {
			insertCardOverwrite = false;
			nextState("login-success-4b");
		}else {
			console.log("PREVSTATE: " + prevState);
			nextState("main-5a");
		}
	}else{
		account.errorTime += 1;
		if (account.errorTime >= 3) {
			nextState("max-error-3b");
			return;
		}
		nextState("error-3a")
	}
});


$(document).on('click', '.withdraw', function(event) {
	event.preventDefault();
	$(".action").html("withdraw")
	nextState("withdraw-amount-6a");
});

$(document).on('click', '.deposit', function(event) {
	event.preventDefault();
	$(".action").html("deposit")
	nextState("deposit-amount-10a");
});

$(document).on('click', '.transfer', function(event) {
	event.preventDefault();
	$(".action").html("transfer")
	nextState("transfer-amount-11a");
});

$(document).on('click', '.enter-amount', function(event) {
	event.preventDefault();
	var input = getInputInt("#amount");
	if (input < 0) {return;}

	if(curState == "withdraw-amount-6a") {
		if (input > account.balance) {
			nextState("insufficient-fund-7a");
		}else {
			updateAccountBalance("Withdraw", input);
			nextState("withdraw-success-7b");
		}
	} else if (curState == "deposit-amount-10a") {
		// add random chance that deposit will fail because of fake money
		updateAccountBalance("Deposit", input);
		nextState("deposit-success-10b");
	} else if (curState == "transfer-amount-11a") {
		if (input > account.balance) {
			nextState("insufficient-fund-7a");
		}else {
			nextState("transfer-account-12a");
			amountToTransfer = input;
		}
	}
});

$(document).on('click', '.input-transfer-account-number', function(event) {
	event.preventDefault();
	var input = getInputInt("#transfer-account-number");
	if (input < 0) {return;}
	if (input > MAX_ACCOUNT_NUMBER || input < MIN_ACCOUNT_NUMBER) {
		nextState("account-error-3c");
	} else if (input == account.accountNumber) {
		nextState("transfer-account-error-13a");
	} else {
		updateAccountBalance("Transfer", amountToTransfer, input);
		nextState("transfer-success-14a");
	}
});

$(document).on('click', '.check-balance', function(event) {
	event.preventDefault();
	nextState("account-balance-15a");
});

$(document).on('click', '.historyBtn', function(event) {
	event.preventDefault();
	var ele = "";
	$.each(account.history, function(index, val) {
		 ele += "<tr><td>"+val.action+"</td> <td>"+
		 			formatCurrency(val.amount)+"</td> <td>"+
		 			$.date(val.date, 'format', 'm/d/Y H:i')+"</td></tr>"
	});
	$(".trans-history-16a tbody").html(ele);
	nextState("trans-history-16a");
});

$(document).on('click', '.sign-out', function(event) {
	event.preventDefault();
	nextState("sign-out-17a");
	logOutTimeout = setTimeout(function(){
		nextState("begin-1a")
	}, 5000);
});

$(document).on('click', '.key, .widekey', function(event) {
	event.preventDefault();
	var input = $(this).html();
	var curVal = $("input:visible").val();
	if (input == "Clear") {
		$("input:visible").val("");
	} else if (input == "Enter") {
		//
	} else {
		if (curState == "passcode-4a" && curVal.length == MAX_PASSCODE_LENGTH) {
			return;
		} else if ($.inArray(curState, ["account-number-2c", "transfer-account-12a",]) >= 0
			&& curVal.length == MAX_ACCOUNT_NUMBER_LENGTH) {
			return;
		}
		$("input:visible").val(curVal + input);
	}
	console.log($("input:visible").val());
});