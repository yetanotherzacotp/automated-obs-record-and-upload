import axios from 'axios'
import https from 'https'
import _ from 'lodash'

import config from '../config.js'

export default async function getAllPlayers() {
  try {
    const result = await axios({
      url: `${config.localGameClientIp}/playerlist`,
      method: 'GET',
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    return result.data
  } catch (error) {
    if (_.startsWith(error.message, 'Spectator mode')) {
      return undefined
    } else if (error.response && error.response.status === 404) {
      console.log('Failed to obtain player data, likely in loading screen')
      return undefined
    }
    throw error
  }
}
