/*

http://52.14.115.181/

GET 
  http://localhost:80/api/wallet/?username=leon&password=password
POST 
  http://localhost:80/api/transfer/?username=leon&password=password&coin1=USD&coin2=BTC&amount=500

*/


var request = require('request');
var cron = require('node-cron');

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




cron.schedule('*/5 * * * * *', function(){
	console.log('firing cron')
	filterData()

});





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







function rateOfChange(coinArr){
	var highestRate = 0;
	var highestCoinName;
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
		if (rate > highestRate){
			highestRate = rate;
			highestCoinName = presentCoin[i].coinName
		}
	}

	console.log(`Highest Rate By Percent: ${highestRate}`)
	console.log(`Highest Rate By Name: ${highestCoinName}`)
	if (highestRate !== 0 && highestRate !== 100 && highestCoinName !== undefined){
		whereMyMoney(highestCoinName)
	}

} //rateofChange







// function finds where my money is at (which coin)
function whereMyMoney(highestCoinName){
	request
	.get('http://localhost:80/api/wallet/?username=leon&password=password', function(err, res, data){
	var data = JSON.parse(data)


	for (var i = 0; i < data.wallet.values.length; i++){
		if (data.wallet.values[i] !== 0){
		coinName = data.wallet.coins[i]
		coinValue = data.wallet.values[i]
		}
	}


	console.log(coinName)
	console.log(coinValue)
	spendThatMoney(coinName, coinValue, highestCoinName)

	})

}


function spendThatMoney(coinName, coinValue, highestCoinName){
	
	console.log('exchange complete')
}






