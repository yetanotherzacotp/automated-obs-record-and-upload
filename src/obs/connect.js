import _ from 'lodash'

export default async function connect (obsClient, ip, port, password) {
  try {
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obsClient.connect(`ws://${ip}:${port}`, password, {
      rpcVersion: 1
    })
    console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
  } catch (error) {
    if (_.startsWith(error.message, 'connect ECONNREFUSED')) {
      console.error('Failed to connect to OBS websocket. Ensure OBS is open, OBS websocket is enabled, and config passed into this app is correct')
      throw new Error('ECONNREFUSED, likely a config issue')
    } else {
      console.error('Unknown error occured trying to connect to OBS websocket')
      console.error('Failed to connect', error.code, error.message)
      throw error
    }
  }
}
