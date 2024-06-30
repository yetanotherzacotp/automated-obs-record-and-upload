# automated-obs-record-and-upload

This WIP set of open-source scripts will run OBS, record your League of Legends games, and then automatically upload them to youtube.

Note I've only tested this on Windows 10, I do not know how this will behave on other OSs. Also note if you're running through the executable that Windows will likely complain about an unknown executable, as I have not created a cert for this application nor is it likely I'll bother too. You can bypass the Windows prompt to continue running the executable.

## Requirements
 - OBS > 28.0.0
 - OBS Websocket enabled

## Features
- [X] Automatically record games
- [ ] Automatically upload to youtube

<br/><br/>

# Running the scripts
You can run the scripts either directly through Node.js or the executable.

## Running through Node.js
If you want to run through Node.js, follow their [installation instructions](https://nodejs.org/en/download/package-manager).

If you have Node.js & npm installed already, then you can jump straight to running the scripts. I've also created a `setup.js` script to help you quickly fill out the `.env` file. To get started, simply run

```
npm run setup
```

Once you're finished with that, you can run the actual scripts by running

```
npm start
```

## Executable
I've bundled the scripts into a single executable for those who don't know how or do not want to set up Node.js. You can find these executables in this project's [Releases](https://github.com/yetanotherzacotp/automated-obs-record-and-upload/releases). Simply download the `.exe` file and follow the steps below to set it up.

### Environment variables
In order to run the executable, you must have a file named `.env` in the same folder as where you have the executable. You can either follow the prompts in the script, or manually make the file. (Note for those who don't know: This is not a text file. 'env' is the extension. A simple way to make this file is to make a text file, rename it, and remove the `txt` as well). In this `.env` file, include the text below
```
OBS_WEBSOCKET_IP=
OBS_WEBSOCKET_PORT=
OBS_WEBSOCKET_PASSWORD=
OBS_SCENE_NAME=
```
For each variable, put the respective value directly after the `=` with no space.

For variables starting with `OBS_WEBSOCKET`, you can obtain these values by going to `Tools` -> `WebSocket Server Settings` -> `Show Connect Info` in OBS. While in `WebSocket Server Settings`, make sure `Enable WebSocket server` is checked.

`OBS_SCENE_NAME` is the name you have setup for your OBS scene that records the League *game* client. Include any spaces, this must be an exact text match.