#include "telemetry_builder.h"
#include "cJSON.h"
#include "esp_log.h"
#include "sensor_fake.h"
#include "config.h" 

char *build_telemetry_json(void)
{
    cJSON *root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "device_id", DEVICE_ID);
    cJSON_AddNumberToObject(root, "uptime", esp_log_timestamp() / 1000);
    cJSON_AddStringToObject(root, "wifi", MQTT_ENABLED ? "connected" : "offline");
    device_state_t st = state_manager_get();
    cJSON_AddStringToObject(root, "state", device_state_to_string(st));

    cJSON_AddNumberToObject(root, "ts", esp_log_timestamp());
    cJSON_AddStringToObject(root, "fw_name", FW_NAME);
    cJSON_AddStringToObject(root, "fw_ver",  FW_VERSION);
    cJSON_AddStringToObject(root, "build", FW_BUILD_DATE " " FW_BUILD_TIME);

#ifdef DEV_MODE
    sensor_data_t s = fake_sensor_read();

    cJSON_AddNumberToObject(root, "temperature", s.temperature);
    cJSON_AddNumberToObject(root, "humidity", s.humidity);
    cJSON_AddNumberToObject(root, "soil_moisture", s.soil_moisture);
#else
    // future: real sensor read
#endif

    char *json = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return json;   // caller must free()
}
