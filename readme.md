## FindMy Dashboard
work in progress


## VERY IMPORTANT - READ ME!
<b> Currently, this project does not include authentication. The design is intended for self-hosting on a local network and is not meant to be exposed to the internet. </b>
#

## notes:

keys:
private_key - private, only you should have this
public_key - key advertised by the ble beacon
hashed_public_key - key used to search the database


## Features
- 2FA managment


### future ideas:
- generate binary for different chips
- event-driven stuff, based on device status byte AND/OR key used
- groups, both for data fetching, hide/show and to select bucket to save data in
- better historical viewer
- decrypt in browser, either input private key or store private key encrypted
- allow devices to have same private key
- pwa?

## Todo

- Guides and info about usage
- Cleanup

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
