#include "mqtt_service.h"
#include "mqtt_config.h"
#include "telemetry_builder.h"
#include "command_handler.h"
#include "esp_log.h"


static const char *TAG = "MQTT_SERVICE";

void mqtt_service_init(void)
{
#if MQTT_ENABLED
    ESP_LOGI(TAG, "MQTT init (enabled)");
#else
    ESP_LOGW(TAG, "MQTT disabled (safe mode)");
#endif
}

void mqtt_publish_telemetry(void)
{
#if MQTT_ENABLED
    char *payload = build_telemetry_json();
    if (!payload) return;

    ESP_LOGI(TAG, "Publishing telemetry: %s", payload);

    // future: esp_mqtt_client_publish(...)
    free(payload);
#else
    ESP_LOGI(TAG, "MQTT OFF → telemetry skipped");
#endif
}



void mqtt_handle_incoming(const char *payload)
{
    ESP_LOGI(TAG, "Incoming payload: %s", payload);
    handle_command_json(payload);
}

void mqtt_service_start(void)
{
#if MQTT_ENABLED
    ESP_LOGI(TAG, "MQTT start (connect + subscribe)");
    // future: esp_mqtt_client_start(client);
#else
    ESP_LOGW(TAG, "MQTT start skipped (disabled)");
#endif
}




