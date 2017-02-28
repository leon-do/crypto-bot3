/*
This bot is selecting the LOWEST rate of change (negative) and transfering 100% of the coins to that

and the coin2(now) - coin2(pass) is LESS than the miner fee.
*/

// ========================================================
// ========================================================
var username = 'lowestcoin1'
var password = 'password'
// ========================================================
// ========================================================

var fs = require('fs')
var request = require('request');
var cron = require('node-cron');


// initial coins. It'll be overwritten once the script starts.
var pastCoin = presentCoin = 
[ { coinName: 'LTC', coinValue: 0 },
  { coinName: 'ETH', coinValue: 0 },
  { coinName: 'DASH', coinValue: 0 },
  { coinName: 'DOGE', coinValue: 0 } ]




cron.schedule('*/2 * * * * *', function(){
    filterData()

});




// select relevant info
function filterData(){
    request.get('http://www.coincap.io/front', function(err, res, data){

        //convert string to object
        data = JSON.parse(data)

        // only use these coins
        const coinNames = ['LTC', 'ETH', 'DASH', 'DOGE'];

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

    var lowestCoinName;
    var lowestCoinRate = 0; //  (coin2 - coin 1) / coin2
    var lowestCoinDifference = 0; //  coin2 - coin1

    //update coins
    pastCoin = presentCoin
    presentCoin = coinArr

    //loop through and compare
    for (var i = 0; i < coinArr.length; i++){
        var rate = (parseFloat(presentCoin[i].coinValue) - parseFloat(pastCoin[i].coinValue)) / parseFloat(presentCoin[i].coinValue) * 100;
        if (rate < lowestCoinRate){
            //update the lowest coin
            lowestCoinName = presentCoin[i].coinName
            lowestCoinRate = rate;
            lowestCoinDifference = Math.abs(parseFloat(presentCoin[i].coinValue) - parseFloat(pastCoin[i].coinValue));
        }
    }


    if (lowestCoinRate < 0 && lowestCoinRate !== 100 && lowestCoinName !== undefined){
        whereMyMoney(lowestCoinName, lowestCoinDifference)
    }

} //rateofChange







// function finds where my money is at (which coin)
function whereMyMoney(lowestCoinName, lowestCoinDifference){
    request
    .get(`http://localhost/api/wallet/?username=${username}&password=${password}`, function(err, res, data){
        
        var data = JSON.parse(data)

        for (var key in data.wallet){
             if (data.wallet[key] !== 0){
                  coinName = key
                  coinValue = data.wallet[key]
             }
        }

    if (coinName !== lowestCoinName){
        feeVsRate(coinName, lowestCoinName, coinValue, lowestCoinDifference)
    }

    })

}



// is the miner fee worth the trade?
function feeVsRate(coin1, coin2, amount, lowestCoinDifference){
    request.get(`https://shapeshift.io/marketinfo/${coin1}_${coin2}`, function(err, res, data){

        data = JSON.parse(data);

        var minerFee = data.minerFee
        console.log(`miner fee: ${minerFee}`)
        console.log(`lowestCoinDifference: ${lowestCoinDifference}`)

        if (data.minerFee < lowestCoinDifference) {
            spendThatMoney(coin1, coin2, amount)
        } 
    })
}



function spendThatMoney(coin1, coin2, amount){

    var url = `http://localhost/api/transfer/?username=${username}&password=${password}&coin1=${coin1}&coin2=${coin2}&amount=${amount}`
    
    
    request.post({url:url}, function (e, r, body) {
        
        request.get(`http://localhost/api/wallet/?username=${username}&password=${password}`, function(err, res, data){
            var data = JSON.parse(data)
            console.log('current balance')
            console.log(data)
        })
    });

}//spendThatMoney
