/*
 * GPIO control library for Raspberry pi
 * Author: D.N. Amerasinghe
 *
*/
var sysfs_gpio = '/sys/class/gpio';

//Raspberry Pi valid GPIO numbers
var valid_gpio = [2, 3, 4, 17, 27, 22, 10, 9, 11, 5, 6, 
                  13, 19, 26, 21, 20, 16, 12, 7, 8, 25, 
                  24, 23, 18, 15, 14];
                  
var exported_gpio = [];              

var fs = require('fs');
var exports = module.exports = {};


var GPIO = {
    OUT: 'out',
    IN: 'in', 
    HI: 1,
    LO: 0,

    init: function(){
        var files = fs.readdirSync(sysfs_gpio);
        for(var i=0;i<files.length;i++){
            if(files[i] === 'export' || files[i] === 'unexport' || files[i].match(/gpiochip/g)){
                continue;
            }
            
            var dir = fs.readFileSync(sysfs_gpio + '/' + files[i] + '/direction');
            
            exported_gpio.push([files[i].substring(4), String(dir).substring(0, dir.length - 1)]);
        }
        //if(exported_gpio.length > 0){ 
            //console.log("Exported "+exported_gpio[0][0]+" - "+exported_gpio[0][1]);
        //}
        /*for(var i=0;i<valid_gpio.length;i++){
            var pin = valid_gpio[i];
            if(fs.accessSync(sysfs_gpio + '/' + 'gpio' + pin.toString() + '/direction')){
                
            }
        }*/
        //Sorting the array
        exported_gpio.sort(function(a, b){return a[0]-b[0]})
        
    },
    //This is called from dir method
    export: function(pin){
        if(!this.valid_gpio(pin)){
            return -1;
        }
        

        if(this.is_exported(pin)){
            console.log('Already exported');
            return 0;
        }

        var fp = fs.openSync(sysfs_gpio + '/' + 'export', 'w');
        fs.writeSync(fp, pin.toString());
        fs.closeSync(fp);
        
        return 0;
    },
    
    unexport: function(pin){
        if(!this.valid_gpio(pin)){
            return -1;
        }
        
        if(!this.is_exported(pin)){
            console.log('Not exported');
            return -1;
        }

        //Setting pin value to 0
        if(this.is_exported(pin) == 'out')
            this.set(pin, 0);
        
        var fp = fs.openSync(sysfs_gpio + '/' + 'unexport', 'w');
        fs.writeSync(fp, pin.toString());
        fs.closeSync(fp);
        
        //Removing from exported list
        this.delete_exported(pin);
    },

    dir: function(pin, dir){
        var cur_dir;

        if(!this.valid_gpio(pin)){
            return -1;
        }
        
        if((cur_dir = this.is_exported(pin))){
            if(cur_dir !== dir){
                console.log('Direction mismatch: changing direction');
                //return -1;
                this.unexport(pin);
            }else{
                console.log('Already in correct direction');
                return;
            }
        }
        
        if(this.export(pin) < 0){
            throw new Error('Cannot export gpio '+pin.toString());
            return -1;
        }

        var fp = fs.openSync(sysfs_gpio + '/' + 'gpio' + pin.toString() + '/direction', 'w');
        fs.writeSync(fp, dir);
        fs.closeSync(fp);
        
        //Adding into exported list
        exported_gpio.push([pin.toString(), dir]);
        //Sorting the array
        exported_gpio.sort(function(a, b){return a[0]-b[0]})
    },

    set: function(pin, val){
        if(!this.valid_gpio(pin)){
            return -1;
        }
        
        var fp = fs.openSync(sysfs_gpio + '/' + 'gpio' + pin.toString() + '/value', 'w');
        fs.writeSync(fp, val.toString());
        fs.closeSync(fp);
    },

    get: function(pin){
        var val = -1;
        
        if(!this.valid_gpio(pin)){
            return -1;
        }
        
        var fp = fs.openSync(sysfs_gpio + '/' + 'gpio' + pin.toString() + '/value', 'r');
        val = fs.readFileSync(fp);
        fs.closeSync(fp);
        
        return val;
    },
    valid_gpio: function(pin){
        if(valid_gpio.indexOf(pin) < 0){
            console.log("Invalid GPIO pin %d", pin);
            throw new Error("Invalid GPIO pin");
            return false;
        }
        
        return true;
    },
    is_exported: function(pin){
        var ret = false;

        for(var i=0;i<exported_gpio.length;i++){
            if(exported_gpio[i][0] === pin.toString()){
                ret = exported_gpio[i][1];
            }
        }

        return ret;
    },
    get_exported: function(){
        return exported_gpio;
    },
    delete_exported: function(pin){
        for(var i=0;i<exported_gpio.length;i++){
            if(exported_gpio[i][0] === pin.toString()){
                exported_gpio.splice(i, 1);
            }
        }
    },
    get_gpiolist: function(){
        return valid_gpio.sort(function(a, b){return a-b});
    }
}

module.exports = GPIO;
