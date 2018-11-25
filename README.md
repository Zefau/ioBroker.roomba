![Logo](admin/roomba.png)
# ioBroker.roomba
 ioBroker adapter for Roomba iRobot 980.

Based on the dorita980 library https://github.com/koalazak/dorita980#readme

[![NPM version](http://img.shields.io/npm/v/iobroker.roomba.svg)](https://www.npmjs.com/package/iobroker.roomba)
[![Travis CI](https://travis-ci.org/Zefau/ioBroker.roomba.svg?branch=master)](https://travis-ci.org/Zefau/ioBroker.roomba)
[![Downloads](https://img.shields.io/npm/dm/iobroker.roomba.svg)](https://www.npmjs.com/package/iobroker.roomba)

[![NPM](https://nodei.co/npm/iobroker.roomba.png?downloads=true)](https://nodei.co/npm/iobroker.roomba/)


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


## Channels & States _(incomplete)_
After sucessful setup the following channels and states will be created:

| Channel | Folder | State | Description |
| ------- | ------ | ----- | ----------- |
| cleaing | - | - | Platzhalter |
| device | - | - | Platzhalter |
| states | - | - | Platzhalter |
| statistics | - | - | Platzhalter |
| - | - | refreshedDateTime | DateTime of last update |
| - | - | refreshedTimestamp | Timestamp of last update |


## Description of Preferences _(incomplete)_
The following payload will be received when calling ```getPreferences()``` (see https://github.com/koalazak/dorita980#getpreferences):

| Object | Index | Type | Description |
| ------ | ----- | ---- | ----------- |
| netinfo | - | object | Network Information of the Roomba connection |
| netinfo | .dhcp | boolean | State whether DHCP is activated |
| netinfo | .addr | ip | IP address |
| netinfo | .mask | ip | Subnet adress |
| netinfo | .gw | ip | Gateway address |
| netinfo | .dns1 | ip | Primary DNS address |
| netinfo | .dns2 | ip | Secondary DNS address |
| netinfo | .bssid | mac | Mac address of router |
| netinfo | .sec | integer | Unknown |
| wifistat | - | object | Unknown |
| wifistat | .wifi | integer | Unknown |
| wifistat | .uap | boolean | Unknown |
| wifistat | .cloud | integer | Unknown |
| wlcfg | .dhcp | object | Unknown |
| wlcfg | .sec | integer | Unknown |
| wlcfg | .ssid | string | Unknown |
| mac | - | mac | Mac address of Roomba |
| country | - | string | Unknown |
| cloudEnv | - | string | Unknown |
| svcEndpoints | .svcDeplId | string | Unknown |
| mapUploadAllowed | - | boolean | Unknown |
| localtimeoffset | - | integer | Unknown |
| ... | - | ... | ... |


## Smart Home / Alexa integration using ioBroker.javascript
Will follow..


## Changelog

### 0.2.1 (2018-11-25)
- (zefau) Fixed / improved automatically retrieving of authentication credentials

### 0.2.0 (2018-11-18)
- (zefau) improved admin interface to automatically retrieve authentication credentials

### 0.1.0 (2018-11-04)
- (zefau) initial version


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
