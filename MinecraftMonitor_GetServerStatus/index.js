/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 */

const mcUtil = require("minecraft-server-util")

module.exports = async function (context, serverName) {
  const result = {
    serverName: serverName,
    isServerRunning: false,
    onlinePlayers: 0
  }

  try {
    const response = await mcUtil(serverName)

    result.isServerRunning = true
    result.onlinePlayers = response.getOnlinePlayers()
  } catch (e) {
    context.log.error('Failed to get server status.', e)
    result.isServerRunning = false
  }

  context.log('Server status = ', JSON.stringify(result))
  return result
}
