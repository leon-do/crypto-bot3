/*

This bot is selecting the HIGHEST rate of change (negative) and transfering 100% of the coins to that

http://52.14.115.181/

*/

// ========================================================
// ========================================================
var username = 'leon'
var password = 'password'
// ========================================================
// ========================================================

var fs = require('fs')
var request = require('request');
var cron = require('node-cron');


// initial coins. It'll be overwritten once the script starts.
var pastCoin = presentCoin = 
[ { coinName: 'BTC', coinValue: 0 },
  { coinName: 'ETH', coinValue: 0 },
  { coinName: 'XRP', coinValue: 0 },
  { coinName: 'LTC', coinValue: 0 },
  { coinName: 'XMR', coinValue: 0 },
  { coinName: 'DASH', coinValue: 0 },
  { coinName: 'ETC', coinValue: 0 },
  { coinName: 'MAID', coinValue: 0 },
  { coinName: 'DOGE', coinValue: 0 },
  { coinName: 'ZEC', coinValue: 0 },
  { coinName: 'LSK', coinValue: 0 } ]




cron.schedule('*/2 * * * * *', function(){
	console.log(" ======================================================== ")
	console.log('firing cron')
	filterData()

});




// select relevant info
function filterData(){
	request.get('http://www.coincap.io/front', function(err, res, data){

		//convert string to object
		data = JSON.parse(data)

		// only use these coins
		const coinNames = ['USD', 'BTC', 'ETH', 'XRP', 'LTC', 'XMR', 'ETC', 'DASH', 'MAID', 'DOGE', 'ZEC', 'LSK'];

		// this array contains all of the important info
		var coinArr = [];

		for (var i = 0; i < data.length; i++){
			//if the name matches anything in the coinNames Array
			if (coinNames.indexOf(data[i].short) >= 0){
				coinArr.push({coinName :data[i].short, coinValue: data[i].price})
			}
		}

		rateOfChange(coinArr)
	})
}






// see if there's a change 1 second ago
function rateOfChange(coinArr){
	var highestRate = 0;
	var highestCoinName;

	//update coins
	pastCoin = presentCoin
	presentCoin = coinArr

	console.log('\n Past Coin Array')
	console.log(pastCoin)
	console.log(" ")

	console.log(`\n Present Coin Array`)
	console.log(presentCoin)
	console.log(" ")

	//loop through and compare
	for (var i = 0; i < coinArr.length; i++){
		var rate = (parseFloat(presentCoin[i].coinValue) - parseFloat(pastCoin[i].coinValue)) / parseFloat(presentCoin[i].coinValue) * 100;
		console.log(`Rate for ${presentCoin[i].coinName} is ${rate}`)
		if (rate > highestRate){
			highestRate = rate;
			highestCoinName = presentCoin[i].coinName
		}
	}

	console.log(`\n Highest Rate By Name: ${highestCoinName} \n Highest Rate By Percent: ${highestRate} \n`)

	if (highestRate > 0 && highestRate !== 100 && highestCoinName !== undefined){
		whereMyMoney(highestCoinName)
	}

} //rateofChange







// function finds where my money is at (which coin)
function whereMyMoney(highestCoinName){
	request
	.get(`http://52.14.115.181/api/wallet/?username=${username}&password=${password}`, function(err, res, data){
		console.log(`http://52.14.115.181/api/wallet/?username=${username}&password=${password}`)
		
		var data = JSON.parse(data)
		console.log(data)

		for (var key in data.wallet){
		     if (data.wallet[key] !== 0){
		          coinName = key
		          coinValue = data.wallet[key]
		     }
		}
	
	if (coinName !== highestCoinName){
		spendThatMoney(coinName, highestCoinName, coinValue)
	}
	
	})

}


function spendThatMoney(coin1, coin2, amount){

	console.log(`\n coin1 is ${coin1} \n coin2 is ${coin2} \n amount is ${amount} \n`)

	var url = `http://52.14.115.181/api/transfer/?username=${username}&password=${password}&coin1=${coin1}&coin2=${coin2}&amount=${amount}`
	
	console.log(`Posted to url: ${url}`)
	
	request.post({url:url}, function (e, r, body) {
		console.log(e)
		console.log(`Exchanged ${amount} coins from ${coin1} to ${coin2} `) 	
		
		request.get(`http://52.14.115.181/api/wallet/?username=${username}&password=${password}`, function(err, res, data){
			var data = JSON.parse(data)
			console.log("current balance")
			console.log(data)
			fs.readFile('magic.txt', 'utf8', function(error,data){
   				console.log(data)
			})
		})
	});

}//spendThatMoney




