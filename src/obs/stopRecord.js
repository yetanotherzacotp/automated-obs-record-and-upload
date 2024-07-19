import ColorConsole from './../utils/colorConsole.js'

export default async function stopRecord (obsClient, sceneName) {
  const result = await obsClient.call('StopRecord')
  ColorConsole.log(`Stopped recording scene ${sceneName}, file saved as ${result.outputPath}`)
  return result.outputPath
}