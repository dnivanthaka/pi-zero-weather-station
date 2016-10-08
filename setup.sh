#!/bin/bash
#http://stackoverflow.com/questions/4018154/node-js-as-a-background-service
cp piweather.service /etc/systemd/system
systemctl start PiWeatherStation
systemctl enable PiWeatherStation
#journalctl -u PiWeatherStation
