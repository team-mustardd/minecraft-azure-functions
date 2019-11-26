/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 */

const restAuth = require("@azure/ms-rest-nodeauth")
const containerInstance = require("@azure/arm-containerinstance")

module.exports = async function (context, container) {
  const credentials = await restAuth.loginWithAppServiceMSI()
  const client = new containerInstance.ContainerInstanceManagementClient(credentials, container.subscriptionId)

  context.log('Stopping server')
  await client.containerGroups.stop(container.resourceGroupName, container.containerGroupName)
  context.log('Server stopped')
}
