import axios from 'axios'
import https from 'https'
import _ from 'lodash'

import config from '../config.js'

export default async function getPlayerName() {
  try {
    const result = await axios({
      url: `${config.localGameClientIp}/activeplayername`,
      method: 'GET',
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })

    if (result.data === 'Unknown') {
      return undefined
    }

    return result.data
  } catch (error) {
    if (_.startsWith(error.message, 'connect ECONNREFUSED')) {
      return undefined
    } else if (_.startsWith(error.code, 'Spectator mode')) {
      return undefined
    } else if (error.response && error.response.status === 404) {
      console.log('Failed to obtain player data, likely in loading screen')
      return undefined
    }
    throw error
  }
}
