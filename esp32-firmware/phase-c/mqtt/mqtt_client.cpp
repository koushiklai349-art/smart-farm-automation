#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

#include "./mqtt_topics.h"
#include "../../phase-b/protocol/command_parser.h"
#include "../../phase-b/services/command_executor.cpp"

WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

char topicCommand[128];
char topicAck[128];
char topicError[128];

const char* MQTT_BROKER = "t2f1000d.ala.asia-southeast1.emqxsl.com";
const char* MQTT_USER = "esp32-01";     // deviceId
const char* MQTT_PASS = "DEVICE_SECRET_HERE";
const char* CA_CERT = R"EOF(
-----BEGIN CERTIFICATE-----
CA Certificate Expiration: 2031.11.10
-----END CERTIFICATE-----
)EOF";

const int   MQTT_PORT   = 8883;

String FARM_ID   = "farm-01";
String DEVICE_ID = "esp32-01";

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';

  if (strstr(topic, "/command")) {
    handle_command((const char*)payload);
  }
}


void setupMqtt() {
  espClient.setCACert(CA_CERT);

  mqttClient.setServer(MQTT_BROKER, 8883);
  mqttClient.setCallback(onMqttMessage);

  snprintf(topicCommand, 128, TOPIC_COMMAND, FARM_ID.c_str(), DEVICE_ID.c_str());
  snprintf(topicAck,     128, TOPIC_ACK,     FARM_ID.c_str(), DEVICE_ID.c_str());
  snprintf(topicError,   128, TOPIC_ERROR,   FARM_ID.c_str(), DEVICE_ID.c_str());
}


void connectMqtt() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect(
      DEVICE_ID.c_str(),.env
      MQTT_USER,
      MQTT_PASS
)) {
  mqttClient.subscribe(topicCommand, 1);
  } else {
      delay(2000);
    }
  }
}

void loopMqtt() {
  if (!mqttClient.connected()) {
    connectMqtt();
  }
  mqttClient.loop();
}

void on_mqtt_message(const char* topic, const char* payload) {
    if (strstr(topic, "/command")) {
        handle_command(payload);
    }
}
