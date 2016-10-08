//http://www.w3schools.com/howto/howto_css_switch.asp
//https://expressjs.com/en/guide/routing.html

var dest_dir = '/root/pi-zero-weather-station/data';

var express = require('express');
var fs = require('fs');
var app = express();
var gpio = require('./gpio.js');
var am2320 = require('./am2320.js');
var ds18b20 = require('./ds18b20.js');
var io = require('socket.io');

var status_led_pin = 17;

var today = new Date();

var dd = today.getDate();
var mm = today.getMonth() + 1;
var yy = today.getFullYear();

if(dd<10){
	dd = '0'+dd;
}
if(mm < 10){
	mm = '0'+mm;
}

var outputfile = dest_dir+'/'+dd+'-'+mm+'-'+yy+'.csv';
var fp = null;

fp = fs.openSync(outputfile, 'a');

//var bootstrap = require('bootstrap');

app.use(express.static('public'));
app.get('/', function(req, res){
    res.end();
    //res.send('It works!!!');
});


/*const exec = require('child_process').exec;
//ls -l | wc -l
exec('ls -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});*/

function writeLine(line){
    fs.writeFileSync(fp, line);
    fs.writeFileSync(fp, '\n');
}

//Init GPIO
gpio.init();


//Initializing the status led
gpio.dir(status_led_pin, gpio.OUT);
gpio.set(status_led_pin, 0);
//gpio.set(status_led_pin, 1);
var heartBeat = setInterval(function(){
	gpio.set(status_led_pin, 1);
	setTimeout(function(){
		gpio.set(status_led_pin, 0);
	}, 200);	
	setTimeout(function(){
		gpio.set(status_led_pin, 1);
	}, 300);	
	setTimeout(function(){
		gpio.set(status_led_pin, 0);
	}, 500);	
}, 3000);
var am2320_json = null
var ds18b20_json = null;
//Initial Data Read
am2320_json = JSON.parse(am2320.readValues());
ds18b20_json = JSON.parse(ds18b20.readValues());
////////////////
var sensorRead = setInterval(function(){
	var d = new Date();
	var am2320_val = am2320.readValues();
	am2320_json = JSON.parse(am2320_val);
	var ds18b20_val = ds18b20.readValues();
	ds18b20_json = JSON.parse(ds18b20_val);

	//console.log(am2320_val);
	//console.log(ds18b20_val);
	writeLine('"'+d.toUTCString()+'","'+am2320_json.temp+'","'+am2320_json.humid+'","'+ds18b20_json.indoor+'","'+ds18b20_json.outdoor+'"');

	//io.emit('newSensorData', {"name":"value"});
}, 60000);





var server = app.listen(80, '0.0.0.0', function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server listening on http://%s:%s", host, port);
});

io.listen(server);
var listener = io.listen(server);
listener.sockets.on('connection', function(socket){
	setInterval(function(){
		socket.emit('newAM2320Data', am2320_json);
		socket.emit('newDS18B20Data', ds18b20_json);
	}, 2000);
});
