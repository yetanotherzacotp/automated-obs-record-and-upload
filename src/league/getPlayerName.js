import axios from 'axios'
import https from 'https'

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
    return result.data
  } catch (error) {
    return undefined
  }
}
