# automated-obs-record-and-upload

This WIP set of scripts will run OBS, record your league games, and then automatically upload them to youtube.

# Requirements
 - Node.js
 - Obs > 28.0.0
 - OBS Websocket enabled

## Features
- [X] Automatically record games
- [ ] Automatically upload to youtube

---
# Environment variables
In order to run the executable, you must create a file `.env` (Note for those who don't know: This is not a text file. 'env' is the extension). In this `.env` file, include the text below
```
OBS_WEBSOCKET_IP=
OBS_WEBSOCKET_PORT=
OBS_WEBSOCKET_PASSWORD=
OBS_SCENE_NAME=
```
For each variable, put the respective value directly after the `=` with no space.

For variables starting with `OBS_WEBSOCKET`, you can obtain these values by going to `Tools` -> `WebSocket Server Settings` -> `Show Connect Info`. While in `WebSocket Server Settings`, make sure `Enable WebSocket server` is checked.

OBS_SCENE_NAME is the name you have setup for your OBS scene that records the League *game* client. Include any spaces, this must be an exact text match.