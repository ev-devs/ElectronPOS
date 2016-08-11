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
sudo echo "sudo service mongodb start"   >> ~/.config/lxsession/LDXE-pi/autostart
sudo echo "electron /home/pi/ElectronPOS" >> ~/.config/lxsession/LDXE-pi/autostart

#this configures the touch screen to have the right aspect ration
sudo echo "max_usb_current=1" >> /boot/config.txt
sudo echo "hdmi_group=2" >> /boot/config.txt
sudo echo "hdmi_mode=1" >> /boot/config.txt
sudo echo "hdmi_mode=87" >> /boot/config.txt
sudo echo "hdmi_cvt 1024 600 60 6 0 0 0" >> /boot/config.txt

#this is for the input calibrator to calibrate the touch screen
#sudo add-apt-repository ppa:tias/xinput-calibrator-ppa
#sudo apt-get update
sudo apt-get install xinput-calibrator

#this should do the calibration
xinput_calibrator --output-type xorg.conf.d --precalib 61 9846 265 9943
echo "geany /usr/share/X11/xorg.conf.d/10-evdev.conf"
echo "Place the above inside that file"
echo " Option \"Calibration\" \"96 3914 155 3899\" "

#This installs the dependencies for the printing capabilities
sudo apt-get install python-imaging python-serial python-setuptools
sudo apt-get install build-essential python-dev

#this is so we can read from a mongo database
sudo python -m pip install pymongo

#this downloads the actual driver for printing capabilities
wget https://sourceforge.net/projects/pyusb/files/PyUSB%201.0/1.0.0/pyusb-1.0.0.zip
unzip pyusb*.zip
cd pyusb*
python setup.py build
sudo python setup.py install

#this is needed for qr codes and barcode printing
git clone https://github.com/lincolnloop/python-qrcode
cd python-qrcode
python setup.py build
sudo python setup.py install

#this is needed cause kevin said so
git clone https://github.com/manpaz/python-escpos.git
cd python-escpos
python setup.py build
sudo python setup.py install
