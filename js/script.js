var prevState = "";
var curState = "begin-1a";
// var curState = "main-5a";
// var curState = "deposit-success-10b";
var logOutTimeout;
var forceOutTimeout;

var newPasscode;

var inputAccountNumber;
var amountToTransfer;
var accountToTransfer;
var amountToDeposit;
var MAX_ACCOUNT_NUMBER = 9999999999;
var MIN_ACCOUNT_NUMBER = 1000000000;
var PASSCODE_LENGTH = 4;
var ACCOUNT_NUMBER_LENGTH = 10;

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
			case "withdraw-amount-6a":
			case "deposit-amount-10a":
			case "transfer-amount-11a":
			case "change-passcode-18a":
			case "change-passcode-18b":
			case "change-passcode-18c":
			$(".prog." + curState).css('display', 'flex');
			break;
			case "main-5a":
			updateAccountBalance(0);
			updateAccountNumber(account.accountNumber);
			break;
		}

		if($.inArray(prevState,["swipe-2d","account-number-2c"]) >= 0) {
			$(".prog.insert").hide();
			$(".prog.no-insert").show();
		} else if(prevState == "insert-2b") {
			$(".prog.insert").show();
			$(".prog.no-insert").hide();
		}

		$("input:visible").focus();
		$(".error-message:visible").html("");

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

function getInput(selector) {
	var input = $(selector).val();
	$(selector).val("");
	return input;
}

function isAccountLocked(){
	return account.errorTime >= 3;
}

function updateAccountBalance(action=null, amount, transferAccount=0) {
	var amt = parseInt(amount);
	if (action) {
		if (action == "Deposit"){
			account.balance += amt;
		}else {
			account.balance -= amt;
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

function startForceOutTimer(){
	forceOutTimeout = setTimeout(function(){
		$('.sign-out').click();
		clearTimeout(forceOutTimeout);
	},300000);
}

$(document).ready(function() {
	nextState(curState, 0)
	loadAccount();
});

$(document).on('click, keydown', 'body', function(event) {
	clearTimeout(forceOutTimeout);
	startForceOutTimer();

	if(event.keyCode == 13) {
		$(".enter-key:visible").click();
	}
});

$(document).on('click', '.homeBtn', function(event) {
	event.preventDefault();
	$("input").val("");

	if (insertCardOverwrite) {
		nextState("take-card-4c");
		return;
	}

	var l = curState.split("-");
	var n = parseInt(l[l.length - 1]);
	if (n < 5 || n == 17) {
		clearTimeout(logOutTimeout);
		nextState("begin-1a", 0);
	}else {
		nextState("main-5a", 0);
	}
});

$(document).on('click', '.backBtn', function(event) {
	event.preventDefault();
	$("input").val("");

	if (insertCardOverwrite && curState != "error-3a") {
		nextState("take-card-4c");
	}else if (curState == "deposit-money-10b") {
		nextState("deposit-amount-10a");
	}else if ($.inArray(curState, ["account-number-2c", "passcode-4a"]) >= 0) {
		nextState("signin-2a")
	}else if ($.inArray(curState, ["account-balance-15a",
									"withdraw-amount-6a",
									"deposit-amount-10a",
									"transfer-amount-11a",
									"change-passcode-18a"]) >= 0) {
		nextState("main-5a");
	}else if($.inArray(curState, ['transfer-success-14a']) >= 0){
		nextState("transfer-amount-11a");
	}else {
		nextState(prevState);
	}
});

$(document).on('click', '#swipe-card', function(event) {
	if (curState == "insert-2b" || curState == "begin-1a" || curState == "signin-2a" || curState == 'swipe-2d' || curState == "account-number-2c") {
		if (isAccountLocked()) {
			nextState("max-error-3b");
		}else{
			inputAccountNumber = account.accountNumber;
			$(".prog.no-insert").show();
			$(".prog.insert").hide();
			nextState("passcode-4a");
		}
	} else {
		console.log("The machine doesn't react to your action.")
	}
});

$(document).on('click', '#insert-card', function(event) {
	if (curState == "insert-2b" || curState == "begin-1a" || curState == "signin-2a" || curState == 'swipe-2d' || curState == "account-number-2c") {
		if (isAccountLocked()) {
			nextState("max-error-3b");
		}else{
			inputAccountNumber = account.accountNumber;
			insertCardOverwrite = true;
			$(".prog.insert").show();
			$(".prog.no-insert").hide();
			nextState("passcode-4a");
		}
	} else {
		console.log("The machine doesn't react to your action.")
	}
});

$(document).on('click', '#take-card', function(event) {
	if (curState == "login-success-4b") {
		insertCardOverwrite = false;
		nextState("main-5a", 0);
	} else if (insertCardOverwrite) {
		insertCardOverwrite = false;
		nextState("begin-1a", 0);
	}else{
		console.log("There is no card to take");
	}
});

$(document).on('click', '#put-money', function(event) {
	if(curState == "deposit-money-10b") {
		updateAccountBalance("Deposit", amountToDeposit);
		nextState("deposit-success-10b");
	}else{
		console.log("The machine is not taking your money");
	}
});

$(document).on('click', '#put-wrong-money', function(event) {
	event.preventDefault();
	/* Act on the event */
	if(curState == "deposit-money-10b") {
		nextState("deposit-fail-10c");
	}else{
		console.log("The machine is not taking your money");
	}
});

$(document).on('click', '#take-money', function(event) {
	if (curState == "withdraw-success-7b") {
		nextState("main-5a");
	}else{
		console.log("There is no money to take");
	}
});

$(document).on('click', '#unlock-account', function(event) {
	if(isAccountLocked()){
		event.preventDefault();
		account.errorTime = 0;
		saveAccount();
		nextState("begin-1a");
	} else{
		console.log("You went to the clerk but they couldn't help you because your account was not locked.");
	}
});


$(document).on('click', '.begin-1a', function(event) {
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
	var input = getInput("#account-number");

	if(input != account.accountNumber){
		nextState("account-error-3c");
		return;
	}

	if (input.length != ACCOUNT_NUMBER_LENGTH) {
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
	var input = getInput("#passcode");

	if (inputAccountNumber == account.accountNumber && input == account.passcode){
		account.errorTime = 0;
		saveAccount();
		if (insertCardOverwrite) {
			insertCardOverwrite = false;
			nextState("login-success-4b");
		}else {
			console.log("PREVSTATE: " + prevState);
			nextState("main-5a");
			startForceOutTimer();
		}
	}else{
		account.errorTime += 1;
		saveAccount();
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
	$(".error-message:visible").html("")
	var input = getInput("#amount");
	if (input <= 0) {
		$(".error-message:visible").html("You must enter a number greater than 0");
		return;
	}

	if(curState == "withdraw-amount-6a") {
		if (parseInt(input) > parseInt(account.balance)) {
			nextState("insufficient-fund-7a");
		}else {
			updateAccountBalance("Withdraw", input);
			nextState("withdraw-success-7b");
		}
	} else if (curState == "deposit-amount-10a") {
		// add random chance that deposit will fail because of fake money
		amountToDeposit = input;
		nextState("deposit-money-10b");
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
	var input = getInput("#transfer-account-number");
	if (input.length != ACCOUNT_NUMBER_LENGTH) {
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
	var history = account.history.slice().reverse();
	$.each(history, function(index, val) {
		ele += "<tr><td>"+val.action+"</td> <td>"+
		formatCurrency(val.amount)+"</td> <td>"+
		$.date(val.date, 'format', 'm/d/Y H:i')+"</td></tr>"
	});
	// $('.trans-history-16a table').stickyTableHeaders('destroy');
	$(".trans-history-16a tbody").html(ele);
	nextState("trans-history-16a");
});

$(document).on('click', '.sign-out', function(event) {
	event.preventDefault();
	nextState("sign-out-17a");
	logOutTimeout = setTimeout(function(){
		nextState("begin-1a");
	}, 5000);
});

$(document).on('click', '.key, .widekey', function(event) {
	event.preventDefault();
	var input = $(this).html().split("<")[0];

	var curVal = $("input:visible").val();
	if (input == "Clear") {
		$("input:visible").val("");
	} else if (input == "Delete") {
		curVal = curVal.slice(0, curVal.length-1);
		console.log(curVal)
		$("input:visible").val(curVal);
	} else if (input == "Enter") {
		//
	} else {
		if (curState.indexOf("passcode") > -1 && curVal.length >= PASSCODE_LENGTH) {
			return;
		// } else if ($.inArray(curState, ["account-number-2c", "transfer-account-12a",]) >= 0
			// && curVal.length >= ACCOUNT_NUMBER_LENGTH) {
} else if (curVal.length >= ACCOUNT_NUMBER_LENGTH){
	return;
}
$("input:visible").val(curVal + input);
}
});


$(document).on('click', '.change-passcode', function(event) {
	event.preventDefault();
	nextState("change-passcode-18a");
	$(".change-passcode-18a .backBtn").show();
});

$(document).on('click', '.change-passcode-enter', function(event) {
	event.preventDefault();
	$(".error-message:visible").html("");
	var input = getInput("#change-passcode");
	if (input.length != PASSCODE_LENGTH) {
		$(".error-message:visible").html("Your passcode must be 4 digits")
		return;
	}

	if (curState == "change-passcode-18a") {
		if (input != account.passcode) {
			account.errorTime += 1;
			saveAccount();
			if (account.errorTime >= 3) {
				nextState("max-error-3b");
				return;
			}
			nextState("error-3a")
			return;
		}
		$(".change-passcode-18a .backBtn").hide();
		nextState("change-passcode-18b");
	} else if (curState == "change-passcode-18b") {
		if (input == account.passcode) {
			$(".error-message:visible").html("Your new passcode cannot be the same as the old one");
			return;
		}
		newPasscode = input;
		nextState("change-passcode-18c");
	} else if (curState == "change-passcode-18c") {
		if (input != newPasscode) {
			$(".error-message:visible").html("New passcodes entered are not the same")
			return;
		}
		account.passcode = input;
		saveAccount();
		nextState("change-passcode-18d");
	}
});