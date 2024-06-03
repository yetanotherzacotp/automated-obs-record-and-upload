import axios from 'axios'
import https from 'https'

import config from '../config.js'

export default async function getAllPlayers() {
  const result = await axios({
    url: `${config.localGameClientIp}/playerlist`,
    method: 'GET',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  })
  return result.data
}
