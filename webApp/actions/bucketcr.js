var AWS = require("aws-sdk");
var os = require("os");
var crypto = require('crypto');
//zawiera funkcje pomocnicze generowania skrótów robienia z jonson obiektu ...
var helpers = require("../helpers");
//accessKeyId ... klucze do amazona 
AWS.config.loadFromPath('../config.json');
//obiekt dla instancji S3 z aws-sdk
var s3 = new AWS.S3();
//plik z linkiem do kolejki
var APP_CONFIG_FILE = "./app.json";
//dane o kolejce wyciągamy z tablicy i potrzebny link przypisujemy do linkKolejki
var tablicaKolejki = helpers.readJSONFile(APP_CONFIG_FILE);
var linkKolejki = tablicaKolejki.QueueUrl
//obiekt kolejki z aws-sdk
var sqs=new AWS.SQS();
var UPLOAD_TEMPLATE = "listOfFiles.ejs";
var fs = require('fs');
var AWS_CONFIG_FILE = "config.json";



//funkcja która zostanie wykonana po wejściu na stronę 
//request dane o zapytaniu, callback funkcja zwrotna zwracająca kod html
var task =  function(request, callback){
	
	
	
var params = { 
 Bucket: 'romanrosiak-projekt',
 Delimiter: '/',
 Prefix: 'uploads/'
}
s3.listObjects(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else   // callback(null, data);
      
	  var filesToDisplay = [];;
	  for(var i = 0; i < data.Contents.length;i++){
		  console.log(data.Contents[i].Key.substring(8));
			if(data.Contents[i].Key != "uploads/"){
				
				var obj = {Key:data.Contents[i].Key, fileName: data.Contents[i].Key.substring(8) };
		    	filesToDisplay.push(obj);	
				var params2 = {
					Bucket: "romanrosiak-projekt",
					Key: data.Contents[i].Key
				};
				var file = require('fs').createWriteStream('images/'+data.Contents[i].Key.substring(8));
				var requestt = s3.getObject(params2).createReadStream().pipe(file);
			}
		    
	  }
	  var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	  
	  callback(null, {template: UPLOAD_TEMPLATE, params:{files:filesToDisplay, bucket:"romanrosiak-projekt", urlQueue: linkKolejki, authenticationData: awsConfig}});          // successful response
});

	
}





exports.action = task
