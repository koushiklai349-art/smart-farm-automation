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
#include "command_verify.h"


static const char *TAG = "CMD_HANDLER";

void handle_command_json(const char *json)
{
char device_secret[64] = {0};

if (!load_device_secret(device_secret, sizeof(device_secret))) {
    ESP_LOGE(TAG, "Device not provisioned (no secret)");
    send_ack("UNKNOWN", "NOT_PROVISIONED");
    return;
}
    if (!json) return;

    cJSON *root = cJSON_Parse(json);
    if (!root) {
        ESP_LOGE(TAG, "Invalid JSON");
        return;
    }

    cJSON *cid = cJSON_GetObjectItem(root, "commandId");
    cJSON *dev = cJSON_GetObjectItem(root, "deviceId");
    cJSON *act = cJSON_GetObjectItem(root, "action");
    cJSON *iat = cJSON_GetObjectItem(root, "issuedAt");
    cJSON *sig = cJSON_GetObjectItem(root, "signature");

    if (!cJSON_IsString(cid) || !cJSON_IsString(dev) ||
        !cJSON_IsString(act) || !cJSON_IsString(iat) ||
        !cJSON_IsString(sig)) {

        ESP_LOGE(TAG, "Command fields missing");
        cJSON_Delete(root);
        return;
    }

  if (!verifyCommandSignature(
    cid->valuestring,
    dev->valuestring,
    act->valuestring,
    iat->valuestring,
    sig->valuestring,
    device_secret
)) {

    ESP_LOGE(TAG, "Invalid signature");
    send_ack(cid->valuestring, "INVALID_SIGNATURE");
    cJSON_Delete(root);
    return;
}


    if (is_duplicate_command(cid->valuestring)) {
        send_ack(cid->valuestring, "DUPLICATE");
        cJSON_Delete(root);
        return;
    }
    if (strcmp(dev->valuestring, DEVICE_ID) != 0) {
    send_ack(cid->valuestring, "WRONG_DEVICE");
    cJSON_Delete(root);
    return;
}

    // ---- execute action ----
    action_t action = ACTION_NONE;

if (strcmp(act->valuestring, "PUMP_ON") == 0) {
    action = ACTION_PUMP_ON;
}

if (action != ACTION_NONE) {
    if (!state_should_execute(action)) {
        send_ack(cid->valuestring, "IGNORED");
        cJSON_Delete(root);
        return;
    }

    if (!failsafe_is_active()) {
        actuator_execute(action);
        state_commit(action);
    }
}


    save_last_command(cid->valuestring);
    send_ack(cid->valuestring, "SUCCESS");

    cJSON_Delete(root);
}


void handle_command(const char* json) {
    handle_command_json(json);
}

