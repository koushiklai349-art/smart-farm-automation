import { executeDeviceCommand } from "../devices/device.manager.js"

export function handleAction(action) {
  console.log("PIPELINE RECEIVED ACTION:", action)

  if (!action || !action.command || !action.target) {
    console.log("❌ Invalid Action")
    return
  }

  executeDeviceCommand(action)
}
