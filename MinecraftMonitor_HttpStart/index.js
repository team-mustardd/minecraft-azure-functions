const df = require("durable-functions")

module.exports = async function (context, req) {
  const serverData = {
    serverName: process.env['SERVER_NAME'],
    container: {
      subscriptionId: process.env['CONTAINER_SUBSCRIPTION_ID'],
      resourceGroupName: process.env['CONTAINER_RESOURCE_GROUP_NAME'],
      containerGroupName: process.env['CONTAINER_GROUP_NAME']
    }
  }

  const client = df.getClient(context)
  const instanceId = await client.startNew('MinecraftMonitor_OrchestratorJS', undefined, serverData)

  context.log(`Started orchestration with ID = '${instanceId}'.`)

  return client.createCheckStatusResponse(context.bindingData.req, instanceId)
}
