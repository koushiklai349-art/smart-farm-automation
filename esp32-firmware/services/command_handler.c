#include "command_handler.h"
#include "cJSON.h"
#include "esp_log.h"
#include <stdlib.h>
#include <string.h>          // ✅ এটা লাগবে strcmp এর জন্য
#include "recovery_manager.h"
#include "esp_system.h"
#include "ota_manager.h"
#include "actuator.h"
#include "state_manager.h"
#include "failsafe.h"

static const char *TAG = "CMD_HANDLER";

void handle_command_json(const char *json)
{
    if (!json) return;

    cJSON *root = cJSON_Parse(json);
    if (!root) {
        ESP_LOGE(TAG, "Invalid JSON");
        return;
    }

    cJSON *cmd = cJSON_GetObjectItem(root, "cmd");
    if (!cJSON_IsString(cmd)) {
        ESP_LOGW(TAG, "Command missing");
        cJSON_Delete(root);
        return;
    }

    ESP_LOGI(TAG, "Command received: %s", cmd->valuestring);

    if (strcmp(cmd->valuestring, "PUMP_ON") == 0) {

    if (!failsafe_is_active()) {
        actuator_execute(ACTION_PUMP_ON);
        state_commit(ACTION_PUMP_ON);
    }

    ESP_LOGI(TAG,
        "ACK: {\"cmd\":\"PUMP_ON\",\"status\":\"executed\"}");

    } else if (strcmp(cmd->valuestring, "PUMP_OFF") == 0) {

    if (!failsafe_is_active()) {
        actuator_execute(ACTION_PUMP_OFF);
        state_commit(ACTION_PUMP_OFF);
    }

    ESP_LOGI(TAG,
        "ACK: {\"cmd\":\"PUMP_OFF\",\"status\":\"executed\"}");



    } else if (strcmp(cmd->valuestring, "RESET_SYSTEM") == 0) {

        ESP_LOGW(TAG, "Remote RESET received");

        recovery_clear();

        ESP_LOGI(TAG,
            "ACK: {\"cmd\":\"RESET_SYSTEM\",\"status\":\"rebooting\"}");

        esp_restart();
        
    }else if (strcmp(cmd->valuestring, "OTA_UPDATE") == 0) {

        ESP_LOGW(TAG, "Remote OTA command received");

        ESP_LOGI(TAG, "ACK: {\"cmd\":\"OTA_UPDATE\",\"status\":\"starting\"}");

        ota_manager_start();  

    } else {

        ESP_LOGW(TAG, "Unknown command");
        ESP_LOGI(TAG, "ACK: {\"status\":\"unknown\"}");
    }
    

    cJSON_Delete(root);
}
