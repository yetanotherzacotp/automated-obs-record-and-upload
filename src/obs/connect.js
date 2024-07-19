import _ from 'lodash'
import ColorConsole from './../utils/colorConsole.js'

export default async function connect (obsClient, ip, port, password) {
  try {
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obsClient.connect(`ws://${ip}:${port}`, password, {
      rpcVersion: 1
    })
    ColorConsole.debug(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
  } catch (error) {
    if (_.startsWith(error.message, 'connect ECONNREFUSED')) {
      ColorConsole.error('Failed to connect to OBS websocket. Ensure OBS is open, OBS websocket is enabled, and config passed into this app is correct')
      throw new Error('ECONNREFUSED, likely a config issue')
    } else {
      ColorConsole.error('Unknown error occured trying to connect to OBS websocket')
      ColorConsole.error('Failed to connect', error.code, error.message)
      throw error
    }
  }
}
