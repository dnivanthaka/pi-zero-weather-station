var sysfs_directory = '/sys/bus/w1/devices';
var sIndoor  = '28-0000055d5569/w1_slave';
var sOutdoor = '28-0000055d5569/w1_slave';

var fs = require('fs');
var buf = new Buffer(16);
var temperature = 0;
var humidity    = 0;

var re = /t=\d*/i

function readValue(filename){
    var value = 0;

    var fp = fs.openSync(sysfs_directory + '/' + filename, 'r');
    value  = fs.readFileSync(fp);


    return value.toString();
}

module.exports = {
    readValues: function(){
        var fp = fs.statSync(sysfs_directory);
        if(fp.isDirectory()){
            //We have a valid directory
            sIndoorValue  = readValue(sIndoor);
            sOutdoorValue = readValue(sOutdoor);

                //indoor:Number(sIndoorValue.match(re)[0].substring(1)),
            output = {
                indoor:Number((sIndoorValue.match(re)[0]).substring(2).toString())/1000,
                outdoor:Number((sOutdoorValue.match(re)[0]).substring(2).toString())/1000
            };

            //console.log(JSON.stringify(sIndoorValue.match(re)));
            return JSON.stringify(output);
        }
    }
}
