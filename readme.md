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


ideas:

- reports tab show what you are currently seeing in your view, shown by one color ✓
- if you click on a group of reports they are shown in the reports tab, indicated by another color ✓
- doubleclicking reports zooms into those reports ✓
- display/show info about a tag based on the status byte AND/OR what key was used for the location
- timestamp based on localization

## Todo

- 2FA codes in client (account management)
- Historical data
- Guides and info about usage
- Cleanup
- Fixed published at
- PWA


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
