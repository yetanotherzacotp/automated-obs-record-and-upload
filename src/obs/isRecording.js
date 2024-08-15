import ColorConsole from './../utils/colorConsole.js'

export default async function isRecordingActive (obsClient) {
  try {
    const result = await obsClient.call('GetRecordStatus')
    return result.outputActive
  } catch (error) {
    ColorConsole.debug(error)
    throw error
  }
}
