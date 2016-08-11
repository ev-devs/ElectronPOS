#!/bin/bash

# First we must update the PI to have the necessary dependencies to even install
sudo apt-get update
sudo apt-get upgrade

# Then we install node.js version 6
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

#Now we install vim. This is needed for debuggin purposes (aka I prefer vim)
sudo apt-get install vim

#Now we install electron to run our app and bower for front end dependencies
sudo npm install -g electron-prebuilt
sudo npm install -g bower

#We need our database before we can run our app
sudo apt-get install mongodb

#This is the actual installation of electron
git clone https://github.com/ev-devs/ElectronPOS
cd ElectronPOS
git submodule init
git submodule update
sudo npm install
sudo bower install bower.json --allow-root

#setup the kinit scripts
sudo echo "sudo service mongodb start"   >> ~/.config/lxsession/LXSESSION/autostart
sudo echo "electron /home/pi/ElectronPOS" >> ~/.config/lxsession/LXSESSION/autostart

sudo reboot
