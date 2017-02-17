var fs = require('fs')

fs.readFile('magic.txt', 'utf8', function(error,data){
    console.log(data)
})