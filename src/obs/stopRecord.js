export default async function stopRecord (obsClient, sceneName, playerChamp, opponentChamp) {
  const result = await obsClient.call('StopRecord')
  console.log(`Stopped recording scene ${sceneName}, file saved as ${result.outputPath}`)
  return result.outputPath
}