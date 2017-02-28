/*
This bot uses the shapeshift API and calculates rate of rate
*/

// ===============================================================
// ===============================================================
var username = 'lowestcoin1'
var password = 'password'
// ===============================================================
// ===============================================================


var request = require('request')

// initial coins. It'll be overwritten once the script starts.
var pastCoin = presentCoin = [ { rate: '0', limit: 0, pair: 'LTC_ETH', maxLimit: 0, min: 0, minerFee: 0.01 }, { rate: '0', limit: 0, pair: 'ETH_LTC', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'LTC_DOGE', maxLimit: 0, min: 0, minerFee: 2 }, { rate: '0', limit: 0, pair: 'DOGE_LTC', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'LTC_DASH', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'DASH_LTC', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'ETH_DOGE', maxLimit: 0, min: 0, minerFee: 2 }, { rate: '0', limit: 0, pair: 'DOGE_ETH', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'ETH_DASH', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'DASH_ETH', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'DOGE_DASH', maxLimit: 0, min: 0, minerFee: 0 }, { rate: '0', limit: 0, pair: 'DASH_DOGE', maxLimit: 0, min: 0, minerFee: 0 } ]



// fire whereMyMoney every 5 seoncds
setInterval(function(){
    whereMyMoney()
}, 5000)





function whereMyMoney(){
    request
    .get(`http://localhost/api/wallet/?username=${username}&password=${password}`, function(err, res, data){

        var coin1 = {};

        // { wallet: { DOGE: 0, DASH: 0, LTC: 0, ETH: 2.6096069959493624 },score: { total: 37.85023347641284 } }
        var data = JSON.parse(data) 

        // find the coin with the money
        for (var key in data.wallet){
             if (data.wallet[key] !== 0){
                  coin1.name = key
                  coin1.value = data.wallet[key]
             }
        }

        // coin1 = { name: 'ETH', value: 2.6096069959493624 }
        shapeshiftAPI(coin1)
    })
}





function shapeshiftAPI(coin1){
    request.get('https://shapeshift.io/marketinfo', function(err, res, data){

        data = JSON.parse(data)

        var coinArray = ['LTC', 'ETH', 'DASH', 'DOGE']
        
        // coinsPairs = coin1_ETC, coin1_BTC etc...
        var coinPairs = []
        for (var i = 0; i < coinArray.length; i++){
            if (coin1.name != coinArray[i]){
                coinPairs.push(`${coin1.name}_${coinArray[i]}`) 
                // coinPairs = [ 'ETH_LTC', 'ETH_DASH', 'ETH_DOGE' ]
            }
        }


        var coinPairData = [];

        // collect all the relevent info. store it in coinPairData
        for (var i = 0; i < data.length; i++){
            if (coinPairs.indexOf(data[i].pair) != -1){
                coinPairData.push(data[i])
            }
        }

        /*
            var coinPairData = 
            [ { rate: '3.85312421',
                limit: 68.66326378,
                pair: 'ETH_LTC',
                maxLimit: 171.65815945,
                min: 0.00051417,
                minerFee: 0.001 },
              { rate: '69356.23581944',
                limit: 67.77005443,
                pair: 'ETH_DOGE',
                maxLimit: 119.78421964,
                min: 0.00005401,
                minerFee: 2 },
              { rate: '0.52675622',
                limit: 67.77005443,
                pair: 'ETH_DASH',
                maxLimit: 169.42513608,
                min: 0.00746666,
                minerFee: 0.002 } ]
        */
        calculateRate(coinPairData, coin1)
    })
}






function calculateRate(coinPairData, coin1){
    pastCoin = presentCoin;
    presentCoin = coinPairData;

    // find the difference between past and present coins
    var coinDifference = [];

    //calculate all of the difference in rate
    for (var i = 0; i < coinPairData.length; i++){
        coinDifference.push(
            {
                pairs: coinPairData[i].pair,
                rate: presentCoin[i].rate - pastCoin[i].rate,
                fee: presentCoin[i].minerFee
            })
    }

    console.log(pastCoin)
    console.log(presentCoin)
    console.log(coinDifference)

    findBestRate(coinDifference, coin1)

}










function findBestRate(coinDifference, coin1){

    // bestCoin can either be furtherst drop or furtherst rise
    var bestCoin = coinDifference[0].rate;

    for (var i = 0; i < coinDifference.length; i++){
        // this is furthest drop
        if (bestCoin > coinDifference[i].rate){
            bestCoin = coinDifference[i]
        }
    }

    // bestCoin is the pair that has the smallest rate of change
    // bestCoin = { pairs: 'ETH_LTC', rate: -0.00379500999999971, fee: 0.001 }
    console.log(bestCoin) 

    // if the rate is more than the fee
    if (Math.abs(bestCoin.rate) > bestCoin.fee){
        transferCoin(bestCoin, coin1)
    }
}






function transferCoin(bestCoin, coin1){
    // bestCoin = { pairs: 'ETH_LTC', rate: -0.00379500999999971, fee: 0.001 }
    // coin1 = { name: 'ETH', value: 2.6096069959493624 }

    var coin1Name = bestCoin.pairs.split('_')[0]
    var coin2Name = bestCoin.pairs.split('_')[1]
    var amount = coin1.value;
    console.log(coin1Name)
    console.log(coin2Name)
    console.log(amount)

    var url = `http://localhost/api/transfer/?username=${username}&password=${password}&coin1=${coin1Name}&coin2=${coin2Name}&amount=${amount}`
    
    
    request.post({url:url}, function (e, r, body) {
        
        request.get(`http://localhost/api/wallet/?username=${username}&password=${password}`, function(err, res, data){
            var data = JSON.parse(data)
            console.log('current balance')
            console.log(data)
        })
    });
}














