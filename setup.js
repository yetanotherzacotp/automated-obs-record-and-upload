import promptSync from 'prompt-sync'
import fs from 'fs'
import _ from 'lodash'

const prompt = promptSync()
const ENV_PATH = '.env'
const ENV_TO_SAVE = {}

console.log('Starting first time setup...')

console.log('Following the prompts below, paste in your OBS websocket details. You can find these by going to "Tools"->"Websocket Server Settings" in OBS. Ensure "Enable Websocket Server" is toggled as well')
ENV_TO_SAVE['OBS_WEBSOCKET_IP'] = prompt('What is your OBS websocket IP? ')
ENV_TO_SAVE['OBS_WEBSOCKET_PORT'] = prompt('What is your OBS websocket port? ')
ENV_TO_SAVE['OBS_WEBSOCKET_PASSWORD'] = prompt('What is your OBS websocket password? ')
console.log('If you do not already have a scene setup for League (the game client, NOT the regular client), make one now')
ENV_TO_SAVE['OBS_SCENE_NAME'] = prompt('What is your League game scene name? ')

const envAsArray = _.toPairs(ENV_TO_SAVE)
const envAsString = _.reduce(envAsArray, (acc, envItem) => {
  return acc += `${envItem[0]}=${envItem[1]}\n`
}, '')

fs.writeFileSync(ENV_PATH,envAsString,{encoding:'utf8',flag:'w'})

console.log('Your info has been saved to the ".env" file. NEVER SHARE OR UPLOAD THESE SECRETS')