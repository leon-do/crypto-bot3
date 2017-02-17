/*

http://52.14.115.181/

GET 
  http://localhost:80/api/wallet/?username=leon&password=password
POST 
  http://localhost:80/api/transfer/?username=leon&password=password&coin1=USD&coin2=BTC&amount=500

*/


var request = require('request');
var cron = require('node-cron');


request
  .get('http://localhost:80/api/wallet/?username=leon&password=password', function(err, res, data){
  	var data = JSON.parse(data)

  	console.log(data.wallet)

  	for (var key in data.wallet){
  		console.log(key)
  	}
  })


cron.schedule('*/1 * * * *', function(){


});




// request.post('http://localhost:80/api/transfer/?username=leon&password=password&coin1=USD&coin2=DOGE&amount=500', 
// 	function(err, httpResponse, body){
// 		console.log(httpResponse.body)
// })



