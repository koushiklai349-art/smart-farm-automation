#ifndef MQTT_CONFIG_H
#define MQTT_CONFIG_H

#include "config.h" 

#define MQTT_BROKER_URI "mqtt://broker.hivemq.com"
#define MQTT_BASE_TOPIC "smartfarm/esp32_001"

#define MQTT_TOPIC_TELEMETRY MQTT_BASE_TOPIC "/telemetry"
#define MQTT_TOPIC_COMMAND   MQTT_BASE_TOPIC "/command"
#define MQTT_TOPIC_STATUS    MQTT_BASE_TOPIC "/status"

#endif
