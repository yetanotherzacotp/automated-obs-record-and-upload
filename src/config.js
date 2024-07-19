import _ from 'lodash'

export default {
  // League
  localGameClientIp: 'https://127.0.0.1:2999/liveclientdata',

  // OBS
  obsWebsocketIp: _.get(process.env, 'OBS_WEBSOCKET_IP'),
  obsWebsocketPort: _.get(process.env, 'OBS_WEBSOCKET_PORT'),
  obsWebsocketPassword: _.get(process.env, 'OBS_WEBSOCKET_PASSWORD'),
  sceneName: _.get(process.env, 'OBS_SCENE_NAME'),

  // Misc
  debug: _.get(process.env, 'DEBUG'),
}