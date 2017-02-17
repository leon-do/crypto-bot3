/*

AWS
http://52.14.115.181/

*/

// ========================================================
// ========================================================
var username = 'low1'
var password = 'password'
// ========================================================
// ========================================================


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
	var lowestRate = 0;
	var lowestCoinName;

	//update coins
	pastCoin = presentCoin
	presentCoin = coinArr

	console.log('Past Coin Array')
	console.log(pastCoin)

	console.log(`Present Coin Array`)
	console.log(presentCoin)

	//loop through and compare
	for (var i = 0; i < coinArr.length; i++){
		var rate = (parseFloat(presentCoin[i].coinValue) - parseFloat(pastCoin[i].coinValue)) / parseFloat(presentCoin[i].coinValue) * 100;
		console.log(`Rate for ${presentCoin[i].coinName} is ${rate}`)
		if (rate < lowestRate){
			lowestRate = rate;
			lowestCoinName = presentCoin[i].coinName
		}
	}

	console.log(`Lowest Rate By Percent: ${lowestRate}`)
	console.log(`Lowest Rate By Name: ${lowestCoinName}`)
	if (lowestRate < 0 && lowestRate !== 100 && lowestCoinName !== undefined){
		whereMyMoney(lowestCoinName)
	}

} //rateofChange







// function finds where my money is at (which coin)
function whereMyMoney(lowestCoinName){
	request
	.get('http://localhost:80/api/wallet/?username=leon&password=password', function(err, res, data){
	var data = JSON.parse(data)

	for (var i = 0; i < data.wallet.values.length; i++){
		if (data.wallet.values[i] !== 0){
		coinName = data.wallet.coins[i]
		coinValue = data.wallet.values[i]
		}
	}


	console.log(`coin name is ${coinName}`)
	console.log(`coin value is ${coinValue}`)
	console.log(`lowestCoinName is ${lowestCoinName}`)
	spendThatMoney(coinName, lowestCoinName, coinValue)

	})

}


function spendThatMoney(coin1, coin2, amount){

	var url = `http://localhost:80/api/transfer/?username=${username}&password=${password}&coin1=${coin1}&coin2=${coin2}&amount=${amount}`
	
	console.log(`Posted to url: ${url}`)
	
	request.post({url:url}, function (e, r, body) {
		console.log(`Exchanged ${amount} coins from ${coin1} to ${coin2} `)
	}, 	
		request.get('http://localhost:80/api/wallet/?username=leon&password=password', function(err, res, data){
			var data = JSON.parse(data)
			console.log("current balance")
			console.log(data)
		})
	);

}//spendThatMoney






