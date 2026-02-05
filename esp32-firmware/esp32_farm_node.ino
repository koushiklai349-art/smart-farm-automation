#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

/* ========= CONFIG ========= */

// 🔐 WiFi
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// 📡 MQTT
const char* MQTT_BROKER = "192.168.1.10"; // broker IP
const int   MQTT_PORT   = 1883;

// 🆔 Device
const char* DEVICE_ID = "esp32-fish-01";

/* =========================== */

WiFiClient espClient;
PubSubClient mqtt(espClient);

unsigned long lastTelemetry = 0;

/* ---------- Helpers ---------- */

void connectWiFi() {
  Serial.print("📶 Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi connected");
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("📡 Connecting MQTT...");
    if (mqtt.connect(DEVICE_ID)) {
      Serial.println(" connected");

      // subscribe command topic
      String cmdTopic = "farm/" + String(DEVICE_ID) + "/command";
      mqtt.subscribe(cmdTopic.c_str());

      // announce presence
      StaticJsonDocument<128> doc;
      doc["deviceId"] = DEVICE_ID;
      doc["status"] = "online";
      doc["fw"] = "v1.0.0";
      doc["at"] = millis();

      char buf[128];
      serializeJson(doc, buf);

      String statusTopic = "farm/" + String(DEVICE_ID) + "/status";
      mqtt.publish(statusTopic.c_str(), buf);
    } else {
      Serial.print(" failed, rc=");
      Serial.print(mqtt.state());
      delay(2000);
    }
  }
}

/* ---------- Command Handler ---------- */

void onCommand(char* topic, byte* payload, unsigned int len) {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, payload, len);

  const char* cmdId = doc["cmdId"];
  const char* action = doc["action"];

  Serial.printf("📥 Command: %s → %s\n", cmdId, action);

  // 🧠 fake execution (for now)
  delay(500);

  // ✅ ACK
  StaticJsonDocument<256> ack;
  ack["cmdId"] = cmdId;
  ack["deviceId"] = DEVICE_ID;
  ack["status"] = "SUCCESS";
  ack["at"] = millis();

  char buf[256];
  serializeJson(ack, buf);

  String ackTopic = "farm/" + String(DEVICE_ID) + "/ack";
  mqtt.publish(ackTopic.c_str(), buf);
}

/* ---------- Telemetry ---------- */

void sendTelemetry() {
  StaticJsonDocument<256> t;
  t["deviceId"] = DEVICE_ID;
  t["temperature"] = random(250, 320) / 10.0;
  t["humidity"] = random(400, 700) / 10.0;
  t["soil_moisture"] = random(300, 600) / 10.0;
  t["uptime"] = millis();
  t["at"] = millis();

  char buf[256];
  serializeJson(t, buf);

  String topic = "farm/" + String(DEVICE_ID) + "/telemetry";
  mqtt.publish(topic.c_str(), buf);
}

/* ---------- Arduino ---------- */

void setup() {
  Serial.begin(115200);
  connectWiFi();

  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(onCommand);
}

void loop() {
  if (!mqtt.connected()) {
    connectMQTT();
  }

  mqtt.loop();

  if (millis() - lastTelemetry > 5000) {
    lastTelemetry = millis();
    sendTelemetry();
  }
}
