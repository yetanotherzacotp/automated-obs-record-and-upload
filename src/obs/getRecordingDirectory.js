export default async function getRecordingDirectory (obsClient) {
  return await obsClient.call('GetRecordDirectory')
}