![ElectronPOS](./data/logo.png)

##What is ElectronPOS?

ElectronPOS is a DIY point of sale system that runs on top of Electron. It was created specifically for the [RASPBERRY PI 3 MODEL B](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/). This software and step-by-step manual will allow you piece together and run your own point of sale device with as little as $800 (Even less if needed) instead of spending thousands of $$$ on a bloated POS.


# Table of Contents  
[Intro](#Intro)  
[Requirements to get started](#Requirements)  
[Why use ElectronPOS?](#ProsAndCons)  
[Parts and Software](#Parts)  
[Raspberry Pi Setup](#Setup)  
[Hardware Setup](#Hardware)  
[Puting it together](#Fusing)   
[Final Remarks](#Ending)  
[FAQ](#FAQ)  
[Contributing Guidelines](#Contribute)  
[See it in action](#Showcase)


#Intro

#ProsAndCons

#Parts

#Setup
 
1. [Setup From MacOSX](###Mac)  
[Setup From Linux](###Linux)  
[Setup From Windows](###Windows)

###Mac

###Linux

###Windows

<hr>
###Start configuring raspberry pi with the following commands

`$ sudo raspi-config`  

> choose "Internationalisation Options"  
> choose "Change Keyboard Layout"  
> choose "Generic 104-key PC"  
> choose "Other"  
> choose "English (US)"  
> choose "English (US)" (again if needed)  
> choose "No AltGr Key"   
> choose "No compose key"  
> choose "Yes"  
> choose "Finish"

 
`$ sudo apt-get update`  
`$ sudo apt-get upgrade`

> We will now install node.js and npm

`$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`  
`$ sudo apt-get install -y nodejs`

> we will now install vim (optional) 

`$ sudo apt-get install vim`

> we will now install electron


`$ sudo npm install -g electron-prebuilt`  
`$ sudo npm install -g bower`

> now we will clone the repo that has our source code in it

`$ git clone https://github.com/ev-devs/ElectronPOS`  
`$ cd ElectronPOS`  
`$ git submodule init`  
`$ git submodule update`  
`$ sudo npm install`  
`$ sudo bower install --allow-root`  





#Hardware

#Fusing

#Ending

#Showcase
This will be a place to put videos of us actually using the electron POS

