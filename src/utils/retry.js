import ColorConsole from './../utils/colorConsole.js'
import config from './../config.js'

export default async function retryWrapper (functionToRetry, functionName, currentRetry = 0, maxRetries = config.defaultMaxRetries) {
  if (currentRetry > maxRetries) {
    const errMsg = `Exceeded max retries calling ${functionName}`
    ColorConsole.debug(errMsg)
    throw new Error(errMsg)
  }

  try {
    ColorConsole.debug(`Calling ${functionName}, retry count ${currentRetry}`)
    return await functionToRetry()
  } catch (err) {
    ColorConsole.debug(`Function ${functionName} failed due to ${err}`)
    return await retryWrapper(functionToRetry, functionName, currentRetry + 1)
  }
}
