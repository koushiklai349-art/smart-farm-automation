#include "heartbeat.h"
#include "mqtt_service.h"
#include "config.h"
#include "esp_log.h"
#include "cJSON.h"

void heartbeat_send(void)
{
#if MQTT_ENABLED

    cJSON *root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "device_id", DEVICE_ID);
    cJSON_AddStringToObject(root, "status", "ONLINE");
    cJSON_AddNumberToObject(root, "ts", esp_log_timestamp());

    char *json = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);

     if (json) {
        mqtt_publish(MQTT_TOPIC_HEARTBEAT, json);
        free(json);
    }

#endif
}