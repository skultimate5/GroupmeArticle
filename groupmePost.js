var request = require('request');
var cheerio = require('cheerio');
var qs = require('qs');
var HTTPS = require('https');
var cron = require('cron');
var app = require('express');

//change this to cwru and other forms
//var searchTerm = formatSearchVal('case western');
var searchTerm = "?s=%20"
var year = 2016; 	//get the current year
var mostRecentArticleDate = new Date("2011-04-12");

const PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}

//Create a server
var server = HTTPS.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
    var cronJob = cron.job("0 0 * * * *", function(){			//runs every hour
    // perform operation e.g. GET request http.get() etc.
    getOnePageArticles(searchTerm, year, function(newArticle){
		if (newArticle != null){
			postMessage(newArticle)
			console.log(newArticle)
		}
		else{
			console.log("No new article")
		}
	});
    
    console.info('cron job completed');
	
	}); 
	
	cronJob.start();
});


function postMessage(newArticle) {
  var botResponse, options, body, botReq;

  var botID = '26d1e43f3942fcab2aa1cc68b1';
  botResponse = newArticle

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function formatSearchVal(searchVal){
	var wordArray = searchVal.split(" ");
	var middleTerm = wordArray[0];
	for (var i = 1; i < wordArray.length; i++){
		if(wordArray[i].length != 0){
			middleTerm = middleTerm + "+" + wordArray[i];
		}
	}
	var searchTerm = '?s=\"' + middleTerm + "\"";
	console.log(searchTerm);
	return searchTerm
}

function formatDate(dateHTML) {
	var splittedDate = dateHTML.substring(0,21).split(" ")
	var month = splittedDate[4]
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
	var day = splittedDate[5]
	var year = splittedDate[6]
	var date = year + "-" + month + "-" + day
	var formattedDate = new Date(date)
	return formattedDate
}

function getOnePageArticles(searchTerm, year, callback){
	var url = "http://www.ultiworld.com/";
	//console.log(url + searchTerm)
	request(url + searchTerm, function(err, resp, body){

		//Check for error
	    if(err){
	        return console.log('Error:', err);
	    }

	    //Check for right status code
	    if(resp.statusCode !== 200){
	        return console.log('Invalid Status Code Returned:', resp.statusCode);
	    }

		  $ = cheerio.load(body);
		  var listElements = $('.snippet-excerpt__heading'); 		//list of articles
		  var datesPosted = $('.snippet-excerpt__byline');			//date for each article
		  var newArticle = null;
		  $(datesPosted).each(function(i, date){
	  	  	var dateHTML = $(date).html();
	  	  	var formattedDate = formatDate(dateHTML);
	  		var substring = dateHTML.substring(0,21).split(" ")[6]		//getting year of article
	  		if (formattedDate > mostRecentArticleDate){			//see if new article is more recent than last posted article
	  			mostRecentArticleDate = formattedDate
	  			newArticle = $(listElements[i]).children().attr('href');
	  		}
		  });	  
		  callback(newArticle);
	});
}
