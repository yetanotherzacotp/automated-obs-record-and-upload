import OBSWebSocket, { EventSubscription } from 'obs-websocket-js'
import _ from 'lodash'
import 'dotenv/config'
import fs from 'fs'

import { firstTimeSetup } from './setup.js'

import config from './src/config.js'

import getPlayerName from './src/league/getPlayerName.js'
import getAllPlayers from './src/league/getAllPlayers.js'

import connect from './src/obs/connect.js'
import startRecord from './src/obs/startRecord.js'
import stopRecord from './src/obs/stopRecord.js'

const SCRIPT_VERSION = 'v0.0.4' // I wanted to just pull it from packagejson but no way I could get working played nicely with both entry points
const TEN_SECONDS_IN_MS = 10000
const ERROR_LOG_FILE_PATH = 'errorlog.txt'

let errorCounter = 0

init().then(() => {
  process.exit()
}).catch(() => {
  if (errorCounter > 10) {
    fs.appendFileSync(ERROR_LOG_FILE_PATH, 'Error count has exceeded 10, fully exiting to prevent infinite error loop',{encoding:'utf8',flag:'w'})
    process.exit()
  } else {
    init() // try again
  }
})

async function init () {
  console.log(`Running ${SCRIPT_VERSION} of automated-obs-record-and-upload script`)
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
    console.error('Failed to obtain required config. Please go through the following prompts to create your .env file')
    firstTimeSetup()
    console.log('Script will auto exit. Please restart now that config is set')
    await sleep(TEN_SECONDS_IN_MS)
    process.exit()
  } else {
    console.log('Config loaded!')
  }
}

async function main () {
  const obsClient = new OBSWebSocket()
  console.log('Connecting to OBS websocket')
  try {
    await connect(obsClient, config.obsWebsocketIp, config.obsWebsocketPort, config.obsWebsocketPassword)
  } catch (error) {
    console.warn('Waiting 30 seconds before retrying - please open OBS now...')
    await sleep(TEN_SECONDS_IN_MS * 3)
    throw error
  }
  console.log('Connected. Beginning to wait for LoL game...')

  let isRecording
  let playerChamp
  let opponentChamp
  while(true) {
    const playerName = await getPlayerName()
    const isActiveGame = !_.isNil(playerName)

    if (!isActiveGame && !isRecording) {
      console.log('No active game, waiting...')
      await sleep(TEN_SECONDS_IN_MS)
    } else if (!isActiveGame && isRecording){
      console.log('Stopping recording, game has ended...')
      const recordingPath = await stopRecord(obsClient, config.sceneName)
      isRecording = false
      await sleep(5000)
      await rename(recordingPath, playerChamp, opponentChamp)
    } else if (isActiveGame && isRecording) {
      console.log('Game is still going, continuing to record...')
      await sleep(TEN_SECONDS_IN_MS)
    } else if (isActiveGame && !isRecording) {
      console.log('Detected game start, starting to record...')
      await startRecord(obsClient, config.sceneName)
      isRecording = true

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
  const pathToFile = _.chain(originalFilePath).split('/').dropRight(1).join('/').value()

  // handle multiple of the same matchup in the same day
  if (await checkFileExists(`${pathToFile}/${newRecordingName}.mp4`)) {
    newRecordingName += await incrementMatchupCounter(pathToFile, newRecordingName)
  }

  const newFilePath = `${pathToFile}/${newRecordingName}.mp4`
  console.log(`renaming ${originalFilePath} to ${newFilePath}`)
  fs.renameSync(originalFilePath, newFilePath, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  });
}

async function checkFileExists(file) {
  return fs.promises.access(file, fs.constants.F_OK)
           .then(() => true)
           .catch(() => false)
}

async function incrementMatchupCounter (pathToFile, recordingName) {
  let recordingCounter = 2 // start at two, since we check if we have a conflict before calling this func
  while (recordingCounter < 20) {
    console.log(`Looping until a non-conflicting file name is found. Counter = ${recordingCounter}`)
    if (await checkFileExists(`${pathToFile}/${recordingName} Part ${recordingCounter}.mp4`)) {
      recordingCounter++
    } else {
      return ` Part ${recordingCounter}`
    }
  }

  console.log('Something went wrong, exiting...')
  throw new Error('Failed to find nonconflicting file name')
}