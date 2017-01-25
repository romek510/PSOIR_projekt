var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "../config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";
var AWS = require("aws-sdk");
AWS.config.loadFromPath('../config.json');
var s3 = new AWS.S3();


var simpledb = new AWS.SimpleDB();

var task = function(request, callback){
	
	//obiekt dzięki któemu będziemy listować plili z bucketu "romanrosiak-projekt" z katalogu uploads
	var params = {
		Bucket: 'romanrosiak-projekt',
		Prefix: 'uploads'
	};
	s3.listObjects(params, function(err, data) {
		if (err) console.log(err, err.stack);
		else     console.log(data);
		
		
		var linki = [];
		
		//przelatujemy przez każdy plik z bucketu
		for(var i in data.Contents) {
			//jeżeli nie jest to nazwa bucketu tylko plik
			if (data.Contents[i].Key != "uploads/"){
				//dopisz do listy do wyświetlenia
				linki.push( {nazwa: data.Contents[i].Key.substring(10)});
			}
			console.log(i);
		}
	
	
		//adres hosta który wrzuca
		var ipAddress = request.connection.remoteAddress;
		console.log(ipAddress);
		
		//ładuje config amazona
		var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
		
				
		//ładuje config z danymi gdzie wrzucić plik i akcją powrotną
		var policyData = helpers.readJSONFile(POLICY_FILE);

		//przygotowuje obiekt konfiguracji wrzucania na s3
		var policy = new Policy(policyData);
		//generuje pola (inputy) wrzucania na s3
		var s3Form = new S3Form(policy);
		var fields = s3Form.generateS3FormFields();
		//tag dla pliku wrzucającego (widoczny w AWS console)
		fields.push( {name : 'x-amz-meta-uploader', value : 'roman.rosiak'});
		//tag dla pliku ip (widoczny w AWS console)
		fields.push( {name : 'x-amz-meta-ip', value : ipAddress});
		//zbędne
		fields.push( {name : 'uploader', value : 'roman.rosiak'});
		//dodaje niewidoczne pola potrzebne do uploadu
		var fieldsSecret=s3Form.addS3CredientalsFields(fields, awsConfig);
		
	
		//zwraca tekst strony www     przekazuje zmienne do templatki któa je wyświetla
		callback(null, {template: INDEX_TEMPLATE, params:{fields:fields, bucket:"romanrosiak-projekt", fileList:linki}});
	});
}

function testx(){
	
}


exports.action = task;
