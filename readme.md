## FindMy Dashboard
work in progress


> [!WARNING]  
> Currently, this project does not include authentication. The design is intended for self-hosting on a local network and is not meant to be exposed to the internet.

## VERY IMPORTANT - READ ME!
<b>  </b>
#

## notes:

keys:
private_key - private, only you should have this
public_key - key advertised by the ble beacon
hashed_public_key - key used to search the database


## Features
- 2FA managment

### Todo before release:
- finish up key settings ✅
    - private key btn needs css ✅
    - add copy button for it as well ✅
- fully remove mui✅
- fix the viewing and clicked reports list ✅
- fix the buttons for opening said list ✅
- sync all button ✅
- remove account data to restart ✅
- osm provider and allow user to change to maptiler with api key ✅
- proxy call for influxdb ✅
- if error during sync, show error message ✅


- test all features and find bugs
    - in the low quality the filters is not working ✅
- write guide and readme
- TEST THE ENTIRE LOGIN FLOW + if unauthorized by removing device via apple ✅
- DOCKERIZE! ✅
- automatic data fetching

### To be improved:
- allow user to customize data fetch interval
- export/import keys and tags
- allow user to set when "low quality" is used
- generate binary for different chips
- event-driven stuff, based on device status byte AND/OR key used
- groups, both for data fetching, hide/show and to select bucket to save data in
- geofencing
- rehaul localstorage system, if used more
- incremental keys?
- better historical viewer
- allow devices to have same private key?
- influxdb bucket is hardcoded, allow user to change it, in the future.
- make some errors more informative
- code cleanup
    - move dialog code into different files
- sizing inconsistencies
- compile all theme stuff into one file and use variables better
- the reports info can get prettier
- error handling on some parts where very obscure errors could happen
- decrypt in browser, either input private key or store private key encrypted
- left click to quickly view detailed reports of click place?
- allow user to change where the differnt panels are and how big they are?
- maybe make the copy private key button select the text?
- pwa?

## Debug

The .env file setup is not very pretty yet, working on a better setup for this as well

### Server

1. `cd server`
2. `python -m venv .venv`
3. `. .venv/bin/activate`
4. Set python interpreter to the one in the .venv
5. `pip install -r requirements.txt`
6. `python app.py`

### Client

1. `cd client`
2. `pnpm i`
3. `pnpm run dev`
