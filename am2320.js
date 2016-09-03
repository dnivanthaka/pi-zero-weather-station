var sysfs_directory = '/sys/bus/i2c/devices/1-005c';
var temperature_file = 'temp1_input';
var humidity_file    = 'humidity1_input';

var fs = require('fs');
var buf = new Buffer(16);
var temperature = 0;
var humidity    = 0;

function readValue(filename){
var value = 0;

    /*fs.open(sysfs_directory + '/' + filename, 'r', function(err, fd){
        if(err){
            return console.error('Cannot open file '+err);
        }

        fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if(err){
                console.log('Unable to read '+err);
            }

            if(bytes > 0)
                value = Number(buf.slice(0, bytes).toString());
            else
                return console.error('Cannot read data');
            //console.log("Temperature = "+temperature);

            fs.close(fd, function(err){});
        });
    });*/
    var fp = fs.openSync(sysfs_directory + '/' + filename, 'r');
    value = fs.readFileSync(fp);

    return Number(value.toString());
}

module.exports = {
    readValues: function(){
        var fp = fs.statSync(sysfs_directory);
        if(fp.isDirectory()){
            //We have a valid directory
            temperature = readValue(temperature_file) / 10;
            humidity    = readValue(humidity_file) / 10;

            output = {
                temp:temperature,
                humid:humidity
            };

            //console.log(JSON.stringify(output));
            return JSON.stringify(output);
        }
    }
}
