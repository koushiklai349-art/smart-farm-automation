// mqtt.publish.js
import { getMQTT } from "./mqtt.client.js";

export function publishCommand(command) {
  const topic = `smartfarm/${command.deviceId}/command`;
  const client = getMQTT();

  client.publish(topic, JSON.stringify(command), { qos: 1 });
}
