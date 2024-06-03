import OBSWebSocket, { EventSubscription } from 'obs-websocket-js'
import _ from 'lodash'
import 'dotenv/config'
import fs from 'fs'

import config from './src/config.js'

import getPlayerName from './src/league/getPlayerName.js'
import getAllPlayers from './src/league/getAllPlayers.js'

import connect from './src/obs/connect.js'
import startRecord from './src/obs/startRecord.js'
import stopRecord from './src/obs/stopRecord.js'

const TEN_SECONDS_IN_MS = 10000

main().then(() => {})

async function main () {
  const obsClient = new OBSWebSocket()
  await connect(obsClient, config.obsWebsocketIp, config.obsWebsocketPort, config.obsWebsocketPassword)

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
      const recordingPath = await stopRecord(obsClient, config.sceneName)
      isRecording = false
      await sleep(5000)
      rename(recordingPath, playerChamp, opponentChamp)
    } else if (isActiveGame && isRecording) {
      // do nothing
    } else if (isActiveGame && !isRecording) {
      await startRecord(obsClient, config.sceneName)
      isRecording = true

      const playerList = await getAllPlayers()
      const player = _.find(playerList, ['riotId', playerName])
      playerChamp = player.championName

      const opponent = _.find(playerList, (person) => {
        return person.team !== player.team && person.position === player.position
      })
      if  (opponent) {
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

function rename (originalFilePath, playerChamp,  opponentChamp) {
  const now = new Date()
  const newRecordingName = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${playerChamp} vs ${opponentChamp}.mp4`
  console.log(newRecordingName)

  const pathToFile = _.chain(originalFilePath).split('/').dropRight(1).join('/').value()
  const newFilePath = `${pathToFile}/${newRecordingName}`
  console.log(`renaming ${originalFilePath} to ${newFilePath}`)
  fs.renameSync(originalFilePath, newFilePath, function(err) {
    if ( err ) console.log('ERROR: ' + err);
});
}
