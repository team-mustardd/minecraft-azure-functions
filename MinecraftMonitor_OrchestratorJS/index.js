/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 */

const df = require("durable-functions")
const moment = require("moment")

module.exports = df.orchestrator(function* (context) {
  const input = context.df.getInput()
  validateRequest(input)

  const customStatus = {
    serverName: input.serverName,
    serverStatus: null
  }
  
  const pollingInterval = process.env['POLLING_INTERVAL_SECONDS']
  const startupEndTime = moment.utc(context.df.currentUtcDateTime).add(5, 'minute')
  const monitorEndTime = moment.utc(context.df.currentUtcDateTime).add(process.env['POLLING_DURATION_HOURS'], 'h')

  context.log('Starting server')
  context.df.setCustomStatus({ ...customStatus, serverStatus: 'Starting' })
  yield context.df.callActivity('MinecraftMonitor_StartServer', input.container)
  context.df.setCustomStatus({ ...customStatus, serverStatus: 'Started' })

  // Wait for the server to finish starting
  while (moment.utc(context.df.currentUtcDateTime).isBefore(startupEndTime)) {
    const serverStatus = yield context.df.callActivity('MinecraftMonitor_GetServerStatus', input.serverName)

    if (serverStatus.isServerRunning) {
      context.log('Server is running')
      context.df.setCustomStatus({ ...customStatus, serverStatus: 'Running' })
      break
    }

    // Server is still starting
    const nextCheck = moment.utc(context.df.currentUtcDateTime).add(5, 's')
    yield context.df.createTimer(nextCheck.toDate())
  }

  // Let the server stay up for at least 1 interval
  const waitForPlayers = moment.utc(context.df.currentUtcDateTime).add(pollingInterval, 's')
  yield context.df.createTimer(waitForPlayers.toDate())

  // Wait for players to finish playing
  while (moment.utc(context.df.currentUtcDateTime).isBefore(monitorEndTime)) {
    const serverStatus = yield context.df.callActivity('MinecraftMonitor_GetServerStatus', input.serverName)

    if (serverStatus.isServerRunning) {
      context.log(`Server is running with ${serverStatus.onlinePlayers} players online`)
      context.df.setCustomStatus({ ...customStatus, serverStatus: 'Running' })

      if (serverStatus.onlinePlayers == 0) {
        context.log('Stopping server')
        context.df.setCustomStatus({ ...customStatus, serverStatus: 'Stopping' })
        yield context.df.callActivity('MinecraftMonitor_StopServer', input.container)
        context.df.setCustomStatus({ ...customStatus, serverStatus: 'Stopped' })
        break
      }
    } else {
      context.log('Server is not running')
      break
    }

    // Players are still playing
    const nextCheck = moment.utc(context.df.currentUtcDateTime).add(pollingInterval, 's')
    yield context.df.createTimer(nextCheck.toDate())
  }

  context.log('Server monitor expiring')
})

function validateRequest (request) {
  if (!request) {
    throw new Error('An input object is required.')
  }
  if (!request.serverName) {
    throw new Error('A server name input is required.')
  }
  if (!request.container) {
    throw new Error('A container input is required.')
  }
  if (!request.container.subscriptionId) {
    throw new Error('A container subscription id input is required.')
  }
  if (!request.container.resourceGroupName) {
    throw new Error('A container resource group name input is required.')
  }
  if (!request.container.containerGroupName) {
    throw new Error('A container container group name input is required.')
  }
}
