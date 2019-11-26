# Azure Functions for managing a Minecraft server

## Setup

Run `npm install`

## Functions Overview

### MinecraftMonitor

A durable function to start a Minecraft server and keep it running until it's idle.

The starter function is `MinecraftMonitor_HttpStart`.

You'll need to configure the following settings:

```json
{
    SERVER_NAME: "<the DNS hostname for the Minecraft server>",
    CONTAINER_SUBSCRIPTION_ID: "<the Azure subscription for the Minecraft container>",
    CONTAINER_RESOURCE_GROUP_NAME: "<the Azure resource group for the Minecraft container>",
    CONTAINER_GROUP_NAME: "<the Azure Minecraft container>"
    POLLING_DURATION_HOURS: <how long to monitor the Minecraft server before quitting>,
    POLLING_INTERVAL_SECONDS: <how long to wait between polling the server>
}
```
