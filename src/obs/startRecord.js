import ColorConsole from './../utils/colorConsole.js'

export default async function recordScene (obsClient, sceneName) {
  await obsClient.call('SetCurrentProgramScene', { sceneName })
  ColorConsole.log(`Swapped to scene ${sceneName}`)

  ColorConsole.log(`Starting to record scene ${sceneName}...`)
  await obsClient.call('StartRecord')
}
