![Logo](admin/roomba.png)
# ioBroker.roomba
ioBroker adapter for iRobot Roomba.

Based on the dorita980 library https://github.com/koalazak/dorita980#readme

[![NPM version](http://img.shields.io/npm/v/iobroker.roomba.svg)](https://www.npmjs.com/package/iobroker.roomba)
[![Travis CI](https://travis-ci.org/Zefau/ioBroker.roomba.svg?branch=master)](https://travis-ci.org/Zefau/ioBroker.roomba)
[![Downloads](https://img.shields.io/npm/dm/iobroker.roomba.svg)](https://www.npmjs.com/package/iobroker.roomba)

[![NPM](https://nodei.co/npm/iobroker.roomba.png?downloads=true)](https://nodei.co/npm/iobroker.roomba/)

**Table of contents**
1. [Setup instructions (automated)](https://github.com/Zefau/ioBroker.roomba#setup-instructions-automated)
2. [Setup instructions (manual)](https://github.com/Zefau/ioBroker.roomba#setup-instructions-manual)
3. [Supported Roomba's](https://github.com/Zefau/ioBroker.roomba#supported-roombas)
4. [Channels & States](https://github.com/Zefau/ioBroker.roomba#channels--states)
5. [Description of Preferences (incomplete)](https://github.com/Zefau/ioBroker.roomba#description-of-preferences-incomplete)
6. [Smart Home / Alexa integration using ioBroker.javascript](https://github.com/Zefau/ioBroker.roomba#smart-home--alexa-integration-using-iobrokerjavascript)
7. [Changelog](https://github.com/Zefau/ioBroker.roomba#changelog)
8. [Credits](https://github.com/Zefau/ioBroker.roomba#credits)
9. [Licence](https://github.com/Zefau/ioBroker.roomba#license)


## Setup instructions (automated)
To automatically setup ioBroker.roomba following the instructions in the admin panel of ioBroker.roomba.

**ATTENTION**: The authentication credentials are not the same as you are using in the smartphone app!

1. Make sure the ioBroker.roomba adapter is started.
2. Make sure your robot is on the Home Base and powered on (green lights on).
3. Then press and hold the HOME button on your robot until it plays a series of tones (about 2 seconds).
4. Release the button and your robot will flash WIFI light.
5. Then come back here press the button to retrieve IP and credentials.

If the automated process fails retrieving your credentials, please use the manual setup.


## Setup instructions (manual)
For manual setup see https://github.com/koalazak/dorita980#how-to-get-your-usernameblid-and-password.


## Supported Roomba's
| Serie | Models _(incomplete)_ | Software-Version | Firmware Info | Supported |
| ----- | --------------------- | ---------------- | ------------- | --------- |
| Roomba® 6xx | 605, 606, 612, 616, 671, 675, 676, 680, 696 | v3.2.40 | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/541#rn_PageTitle)  | _unknown_ |
| Roomba® 7xx | 774, 785, | - | | _unknown_ |
| Roomba® 8xx | 880, 886, 891, 896 | - | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/541#rn_PageTitle) | (most likely not) |
| Roomba® 8xx | 895 | v3.2.10 | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/541#rn_PageTitle) | not yet supported |
| Roomba® 9xx | 965, 981 | - | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/529#rn_PageTitle) | (most likely) |
| Roomba® 9xx | 960, 966, 980 | v2.4.6-3 | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/529#rn_PageTitle) | **supported** |
| Roomba® i | i7 (7150), i7+ (7550) | v1.4 | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/19549#rn_PageTitle) | _unknown_ |
| Roomba® e5 | e5 | v3.4.42 | [Release Notes](https://homesupport.irobot.com/app/answers/detail/a_id/6345#rn_PageTitle) | _unknown_ |

Please help me regarding the supported devices and let me [know via an issue](https://github.com/Zefau/ioBroker.roomba/issues), whether your Roomba model is supported!


## Channels & States
After sucessful setup the following channels and states will be created:

| Channel | Folder | State | Description |
| ------- | ------ | ----- | ----------- |
| cleaning | - | - | Commands and information regarding cleaning process |
| cleaning | last | - | Last commands sent to robot |
| cleaning | last | command | Last command sent to robot |
| cleaning | last | timestamp | Timestamp last command was sent |
| cleaning | last | datetime | DateTime last command was sent |
| cleaning | last | initiator | Initiator of last command |
| cleaning | last | cycle | Platzhalter |
| cleaning | last | phase | Platzhalter |
| cleaning | last | error | Indicates an error during last mission |
| cleaning | schedule | - | Platzhalter |
| cleaning | schedule | cycle | Schedule cycle (Sunday to Saturday) |
| cleaning | schedule | hours | Hour to start cycle (Sunday to Saturday) |
| cleaning | schedule | minutes | Minute to start cycle (Sunday to Saturday) |
| cleaning | - | dock | Send the robot to the docking station |
| cleaning | - | pause | Pause the current cleaning process |
| cleaning | - | resume | Resume the current cleaning process |
| cleaning | - | start | Start a cleaning process |
| cleaning | - | stop | Stop the current cleaning process |
| device | - | - | Device information |
| device | network | - | Network information |
| device | network | dhcp | State whether DHCP is activated |
| device | network | router | Mac address of router |
| device | network | ip | IP address |
| device | network | subnet | Subnet adress |
| device | network | gateway | Gateway address |
| device | network | dns1 | Primary DNS address |
| device | network | dns2 | Secondary DNS address |
| device | preferences | - | Set preferences |
| device | preferences | binPause | **UNKNOWN** |
| device | preferences | carpetBoostAuto | Automatic: Roomba will automatically boost its vacuum power to deep clean carpets. |
| device | preferences | carpetBoostHigh |Performance Mode: Roomba will always boost its vacuum to maximise cleaning performance on all floor surfaces. |
| device | preferences | ecoCharge | **UNKNOWN** |
| device | preferences | noAutoPasses | One Pass: Roomba will cover all areas with a single cleaning pass. |
| device | preferences | noPP | **UNKNOWN** |
| device | preferences | openOnly | **UNKNOWN** |
| device | preferences | schedHold | **UNKNOWN** |
| device | preferences | twoPass | Roomba will cover all areas a second time. This may be helpful in homes with pets or for occasional deep cleaning. |
| device | versions | - | Version information |
| device | versions | hardwareRev | Hardware Revision |
| device | versions | batteryType | Battery Type |
| device | versions | soundVer | **UNKNOWN** |
| device | versions | uiSwVer | **UNKNOWN** |
| device | versions | navSwVer | **UNKNOWN** |
| device | versions | wifiSwVer | **UNKNOWN** |
| device | versions | mobilityVer | **UNKNOWN** |
| device | versions | bootloaderVer | Bootloader Version |
| device | versions | umiVer | **UNKNOWN** |
| device | versions | softwareVer | Software Version |
| device | - | \_rawData | Raw preferences data as json |
| device | - | mac | Mac address of the robot |
| device | - | name | Name of the robot |
| states | - | - | Status information |
| states | - | \_connected | Connection state |
| states | - | battery | Battery level of the robot |
| states | - | binFull | State whether bin status is full |
| states | - | binInserted | State whether bin is inserted |
| states | - | docked | State whether robot is docked |
| states | - | signal | Signal strength |
| states | - | status | Current status of the robot |
| statistics | - | - | Statistic Information |
| statistics | missions | - | Mission Statistics |
| statistics | missions | failed | Number of failed cleaning jobs |
| statistics | missions | succeed | Number of successful cleaning jobs |
| statistics | missions | total | Number of cleaning jobs |
| statistics | time | - | Time Statistics |
| statistics | time | avgMin | **UNKNOWN** |
| statistics | time | hOnDock | **UNKNOWN** |
| statistics | time | nAvail | **UNKNOWN** |
| statistics | time | estCap | **UNKNOWN** |
| statistics | time | nLithChrg | **UNKNOWN** |
| statistics | time | nNimhChrg | **UNKNOWN** |
| statistics | time | nDocks | **UNKNOWN** |
| - | - | refreshedDateTime | DateTime of last update |
| - | - | refreshedTimestamp | Timestamp of last update |


## Description of Preferences _(incomplete)_
The following payload will be received when calling ```getPreferences()``` (see https://github.com/koalazak/dorita980#getpreferences):

| Object | Index | Type | Description | ioBroker State |
| ------ | ----- | ---- | ----------- | -------------- |
| netinfo | - | object | Network Information of the Roomba connection | - |
| netinfo | .dhcp | boolean | State whether DHCP is activated | device.network.dhcp |
| netinfo | .addr | ip | IP address | device.network.ip |
| netinfo | .mask | ip | Subnet adress | device.network.subnet |
| netinfo | .gw | ip | Gateway address | device.network.gateway |
| netinfo | .dns1 | ip | Primary DNS address | device.network.dns1 |
| netinfo | .dns2 | ip | Secondary DNS address | device.network.dns2 |
| netinfo | .bssid | mac | Mac address of router | device.network.router |
| netinfo | .sec | integer | Unknown | _(not mapped)_ |
| wifistat | - | object | Unknown | - |
| wifistat | .wifi | integer | Unknown | _(not mapped)_ |
| wifistat | .uap | boolean | Unknown | _(not mapped)_ |
| wifistat | .cloud | integer | Unknown | _(not mapped)_ |
| wlcfg | - | object | Unknown | - |
| wlcfg | .sec | integer | Unknown | _(not mapped)_ |
| wlcfg | .ssid | string | Unknown | _(not mapped)_ |
| mac | - | mac | Mac address of Roomba | - |
| country | - | string | Unknown | - |
| cloudEnv | - | string | Unknown | - |
| svcEndpoints | .svcDeplId | string | Unknown | - |
| mapUploadAllowed | - | boolean | Unknown | - |
| localtimeoffset | - | integer | Unknown | - |
| ... | - | ... | ... | - |

Please help me regarding the description of the preferences. If you know the meaning of preferences stated as unknown in the table, let me [know their meaning via an issue](https://github.com/Zefau/ioBroker.roomba/issues)!


## Smart Home / Alexa integration using ioBroker.javascript
Will follow..


## Changelog

### Current development
- (zefau) Image / Map of the current cleaning mission will be created

### 0.2.3 (2018-12-03)
- (zefau) Fixed an issue encrypting the password when entered by user (no automated retrieval)

### 0.2.2 (2018-12-02)
- (zefau) Password will now be stored encrypted

Note: If you are coming from an earlier version, you have to (1) empty your settings, (2) save, (3) restart the adapter and (4) enter / fetch credentials again (duo to the fact that password will be stored encrypted now)

### 0.2.1 (2018-11-25)
- (zefau) Fixed / improved automatically retrieving of authentication credentials

### 0.2.0 (2018-11-18)
- (zefau) improved admin interface to automatically retrieve authentication credentials

### 0.1.0 (2018-11-04)
- (zefau) initial version


## Credits
Thanks to [@koalazak](https://github.com/koalazak) for the [unofficial iRobot Roomba 980 node.js library (SDK)](https://github.com/koalazak/dorita980#readme).


## License
The MIT License (MIT)

Copyright (c) 2018 Zefau <zefau@mailbox.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
