import { updateDeviceStatus } from "./store/device.runtime.store.js";
import { pushCommandEvent } from "./views/command.timeline.view.js";

export function handleBackendEvent(event) {
  if (event.type === "DEVICE_ACK") {
    updateDeviceStatus(event.deviceId, "OK");
    pushCommandEvent(event);
  }

  if (event.type === "DEVICE_ERROR") {
    updateDeviceStatus(event.deviceId, "ERROR");
    pushCommandEvent(event);
  }
}
