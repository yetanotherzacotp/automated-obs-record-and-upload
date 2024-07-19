import OBSWebSocket, { EventSubscription } from 'obs-websocket-js'
import _ from 'lodash'
import 'dotenv/config'
import fs from 'fs'

import { firstTimeSetup } from './setup.js'
import ColorConsole from './src/utils/colorConsole.js'

import config from './src/config.js'

import getPlayerName from './src/league/getPlayerName.js'
import getAllPlayers from './src/league/getAllPlayers.js'

import connect from './src/obs/connect.js'
import startRecord from './src/obs/startRecord.js'
import stopRecord from './src/obs/stopRecord.js'
import isRecordingActive from './src/obs/isRecording.js'

const SCRIPT_VERSION = 'v0.0.5' // I wanted to just pull it from packagejson but no way I could get working played nicely with both entry points
const TEN_SECONDS_IN_MS = 10000
const COUNTER_SLEEP_LENGTH_IN_MS = 750
const ERROR_LOG_FILE_PATH = 'errorlog.txt'

const ALLOWED_RETRIES = 10
let errorCounter = 0

init().then(() => {
  process.exit()
}).catch(() => {
  ColorConsole.warn(`${ColorConsole.BG_COLORS.RED}Script failed critically, attempting to restart. Will fully exit after ${ALLOWED_RETRIES - errorCounter} more tries`)
  retry(init)
})

function retry (fn) {
  return fn().catch(function(err) { 
    if (errorCounter <= ALLOWED_RETRIES) {
      fs.appendFileSync(ERROR_LOG_FILE_PATH, 'Error count has exceeded 10, fully exiting to prevent infinite error loop',{encoding:'utf8',flag:'w'})
      process.exit()
    } else {
      ColorConsole.warn(`${ColorConsole.BG_COLORS.RED}Script failed critically, attempting to restart. Will fully exit after ${ALLOWED_RETRIES - errorCounter} more tries`)
      return retry(fn)
    }
  })
}

async function init () {
  ColorConsole.logCyanFG(`Running ${SCRIPT_VERSION} of automated-obs-record-and-upload script`)
  await checkOrCreateConfig()
  try {
    await main()
  } catch (error) {
    const now = new Date()
    const errorString = `${now.toString()} | Something unexpectedly went wrong: ${error.toString()}`

    if (errorCounter === 0) {
      fs.writeFileSync(ERROR_LOG_FILE_PATH, `ERROR LOGS FOR version ${SCRIPT_VERSION}`, {encoding: 'utf8', flag:'w' })
    }
    fs.appendFileSync(ERROR_LOG_FILE_PATH, errorString, {encoding: 'utf8', flag:'w' })

    errorCounter++
    throw error
  }
}

async function checkOrCreateConfig () {
  if (
    _.isNil(config.obsWebsocketIp) ||
    _.isNil(config.obsWebsocketPort) ||
    _.isNil(config.obsWebsocketPassword) ||
    _.isNil(config.sceneName)
  ) {
    ColorConsole.error('Failed to obtain required config. Please go through the following prompts to create your .env file')
    firstTimeSetup()
    ColorConsole.log('Script will auto exit. Please restart now that config is set')
    await sleep(TEN_SECONDS_IN_MS)
    process.exit()
  } else {
    ColorConsole.log('Config loaded!')
  }
}

let playerChamp
let opponentChamp

async function main () {
  const obsClient = new OBSWebSocket()
  ColorConsole.log('Connecting to OBS websocket')
  try {
    await connect(obsClient, config.obsWebsocketIp, config.obsWebsocketPort, config.obsWebsocketPassword)
  } catch (error) {
    ColorConsole.warn('Waiting 30 seconds before retrying - please open OBS now...')
    await sleep(TEN_SECONDS_IN_MS * 3)
    throw error
  }
  ColorConsole.log('Connected. Beginning to wait for LoL game...')

  let checkCounter = 0
  while(true) {
    const playerName = await getPlayerName()
    const isActiveGame = !_.isNil(playerName)
    const isRecording = await isRecordingActive(obsClient)

    if (!isActiveGame && !isRecording) {
      if (checkCounter < 6) {
        ColorConsole.logWaiting('No active game, waiting', checkCounter, ColorConsole.FG_COLORS.CYAN)
        checkCounter++
      } else {
        ColorConsole.logInPlaceOverwrite('No active game, waiting', ColorConsole.FG_COLORS.CYAN)
        checkCounter = 0
      }
      await sleep(COUNTER_SLEEP_LENGTH_IN_MS)
    } else if (!isActiveGame && isRecording){
      ColorConsole.clearLine()
      checkCounter = 0
      ColorConsole.log('Stopping recording, game has ended...')
      const recordingPath = await stopRecord(obsClient, config.sceneName)
      await sleep(5000)
      await rename(recordingPath, playerChamp, opponentChamp)
    } else if (isActiveGame && isRecording) {
      if (checkCounter < 6) {
        ColorConsole.logWaiting('Game is still going, continuing to record', checkCounter, ColorConsole.FG_COLORS.CYAN)
        checkCounter++
      } else {
        ColorConsole.logInPlaceOverwrite('Game is still going, continuing to record', ColorConsole.FG_COLORS.CYAN)
        checkCounter = 0
      }
      await sleep(COUNTER_SLEEP_LENGTH_IN_MS)
    } else if (isActiveGame && !isRecording) {
      ColorConsole.clearLine()
      checkCounter = 0
      ColorConsole.log('Detected game start, starting to record...')
      await startRecord(obsClient, config.sceneName)

      const playerList = await getAllPlayers()
      const player = _.find(playerList, ['riotId', playerName])
      playerChamp = player.championName

      const opponent = _.find(playerList, (person) => {
        return person.team !== player.team && person.position === player.position
      })
      if (opponent) {
        opponentChamp = opponent.championName
      } else {
        opponentChamp = 'Unknown Champ'
      }
      await sleep(5000) // sleep to prevent checking if OBS is recording too soon, otherwise OBS websocket call will error
    }
  }
}

function sleep (timeoutLength) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeoutLength);
  });
}

async function rename (originalFilePath, playerChamp,  opponentChamp) {
  const now = new Date()
  let newRecordingName = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${playerChamp} vs ${opponentChamp}`
  const fileExtension = getFileExtension(originalFilePath)
  const pathToFile = _.chain(originalFilePath).split('/').dropRight(1).join('/').value()

  // handle multiple of the same matchup in the same day
  if (await checkFileExists(`${pathToFile}/${newRecordingName}.${fileExtension}`)) {
    newRecordingName += await incrementMatchupCounter(pathToFile, newRecordingName)
  }

  const newFilePath = `${pathToFile}/${newRecordingName}.${fileExtension}`
  ColorConsole.log(`renaming ${originalFilePath} to ${newFilePath}`)
  fs.renameSync(originalFilePath, newFilePath, function(err) {
    if ( err ) ColorConsole.warn('ERROR: ' + err);
  });
}

async function checkFileExists(file) {
  return fs.promises.access(file, fs.constants.F_OK)
           .then(() => true)
           .catch(() => false)
}

function getFileExtension(filepath) {
  try {
    return _.split(originalFilePath, '.')[1]
  } catch (err) {
    return 'mp4'
  }
}

async function incrementMatchupCounter (pathToFile, recordingName) {
  let recordingCounter = 2 // start at two, since we check if we have a conflict before calling this func
  while (recordingCounter < 20) {
    ColorConsole.log(`Looping until a non-conflicting file name is found. Counter = ${recordingCounter}`)
    if (await checkFileExists(`${pathToFile}/${recordingName} Part ${recordingCounter}.mp4`)) {
      recordingCounter++
    } else {
      return ` Part ${recordingCounter}`
    }
  }

  ColorConsole.error('Something went wrong, exiting...')
  throw new Error('Failed to find nonconflicting file name')
}