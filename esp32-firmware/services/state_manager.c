#include "state_manager.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "nvs.h"

static const char *TAG = "STATE_MGR";

static action_t last_action = ACTION_NONE;
static device_state_t current_state = STATE_SAFE_IDLE;

// 🔑 NVS keys
#define NVS_NAMESPACE "state"
#define KEY_LAST_ACT  "last_action"
#define KEY_LAST_CMD "last_cmd"

void state_manager_init(void)
{
    state_load();
    ESP_LOGI(TAG, "State manager initialized (last_action=%d)", last_action);
    current_state = STATE_SAFE_IDLE;
}

bool state_should_execute(action_t action)
{
    if (action == ACTION_NONE) return false;

    if (action == last_action) {
        ESP_LOGI(TAG, "Action %s ignored (same as last)",
                 action_to_string(action));
        return false;
    }

    return true;   // ❗ do NOT save yet
}

void state_commit(action_t action)
{
    last_action = action;
    state_save();
}

device_state_t state_manager_get(void)
{
    return current_state;
}

void state_manager_set(device_state_t state)
{
    current_state = state;
}
/* ================= NVS ================= */

void state_save(void)
{
    nvs_handle_t nvs;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &nvs) == ESP_OK) {
        nvs_set_i32(nvs, KEY_LAST_ACT, (int32_t)last_action);
        nvs_commit(nvs);
        nvs_close(nvs);

        ESP_LOGI(TAG, "State saved (last_action=%d)", last_action);
    }
}

void state_load(void)
{
    nvs_handle_t nvs;
    int32_t stored = ACTION_NONE;

    if (nvs_open(NVS_NAMESPACE, NVS_READONLY, &nvs) == ESP_OK) {
        if (nvs_get_i32(nvs, KEY_LAST_ACT, &stored) == ESP_OK) {
            last_action = (action_t)stored;
            ESP_LOGI(TAG, "State restored (last_action=%d)", last_action);
        }
        nvs_close(nvs);
    }
}


bool is_duplicate_command(const char* commandId)
{
    nvs_handle_t nvs;
    char lastCmd[64] = {0};
    size_t len = sizeof(lastCmd);

   if (nvs_get_str(nvs, KEY_LAST_CMD, lastCmd, &len) != ESP_OK) {
    nvs_close(nvs);
    return false;
   }

    return (strcmp(lastCmd, commandId) == 0);
}

void save_last_command(const char* commandId)
{
    nvs_handle_t nvs;
    if (nvs_open("state", NVS_READWRITE, &nvs) == ESP_OK) {
        nvs_set_str(nvs, KEY_LAST_CMD, commandId);
        nvs_commit(nvs);
        nvs_close(nvs);
    }
}
/* ================= DEVICE SECRET ================= */

#define SEC_NAMESPACE "sec"
#define KEY_DEVICE_SECRET "device_secret"

bool is_device_provisioned(void)
{
    nvs_handle_t nvs;
    size_t len = 0;

    if (nvs_open(SEC_NAMESPACE, NVS_READONLY, &nvs) != ESP_OK) {
        return false;
    }

    esp_err_t err = nvs_get_str(nvs, KEY_DEVICE_SECRET, NULL, &len);
    nvs_close(nvs);

    return (err == ESP_OK && len > 0);
}

bool load_device_secret(char *out, size_t maxLen)
{
    nvs_handle_t nvs;
    size_t len = maxLen;

    if (nvs_open(SEC_NAMESPACE, NVS_READONLY, &nvs) != ESP_OK) {
        return false;
    }

    esp_err_t err = nvs_get_str(nvs, KEY_DEVICE_SECRET, out, &len);
    nvs_close(nvs);

    return (err == ESP_OK);
}
