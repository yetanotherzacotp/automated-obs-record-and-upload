export default async function recordScene (obsClient, sceneName) {
  await obsClient.call('SetCurrentProgramScene', { sceneName })
  console.log(`Swapped to scene ${sceneName}`)

  console.log(`Starting to record scene ${sceneName}...`)
  await obsClient.call('StartRecord')
}
