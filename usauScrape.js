var request = require('request');
var cheerio = require('cheerio');
var HTTPS = require('https');
var express = require('express')
    , app = express()


var url = 'http://www.usaultimate.org/news/default.aspx';

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(app.get('port'), function () {
	console.log('Example app listening on port ' + app.get('port'));

	getTodayArticles(url, function(newArticles){
		if (newArticles.length > 0){
				console.log(newArticles[i])
		}
		else{
			//put the time that this was printed as well
			console.log("No new article")
		}
	});
});

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function formatDate(day, month, year) {
	var monthNum;

	switch (month){
		case "Jan":
			monthNum = 1;
			break;
		case "Feb":
			monthNum = 2;
			break;
		case "Mar":
			monthNum = 3;
			break;
		case "Apr":
			monthNum = 4;
			break;
		case "May":
			monthNum = 5;
			break;
		case "Jun":
			monthNum = 6;
			break;
		case "Jul":
			monthNum = 7;
			break;
		case "Aug":
			monthNum = 8;
			break;
		case "Sep":
			monthNum = 9;
			break;
		case "Oct":
			monthNum = 10;
			break;
		case "Nov":
			monthNum = 11;
			break;
		case "Dec":
			monthNum = 12;
			break;

	}
	var date = year + "-" + month + "-" + day
	var formattedDate = new Date(date)
	return formattedDate
}

function getTodayArticles(url, callback){
	//console.log(url + searchTerm)
	request(url, function(err, resp, body){

		//Check for error
	    if(err){
	        return console.log('Error:', err);
	    }

	    //Check for right status code
	    if(resp.statusCode !== 200){
	        return console.log('Invalid Status Code Returned:', resp.statusCode);
	    }

		  $ = cheerio.load(body);
		  var listElements = $('.bold')
		  var datesPosted = $('.time');
		  var newArticles = [];
		  var formattedDate, articleName;
		  $(datesPosted).each(function(i, date){
	  	  	var dateHTML = $(date).html();
	  	  	var splittedDate = dateHTML.substring(0,21).split(" ")
	  	  	formattedDate = formatDate(splittedDate[1], splittedDate[0], splittedDate[2])
	  	  	console.log(formattedDate)
	  	  	console.log($(listElements[i]).text());
	  	  	console.log(url + ($(listElements[i]).attr("href")));
		  });
		  callback(newArticles);
	});
}
