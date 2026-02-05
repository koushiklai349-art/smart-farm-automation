#include "state_manager.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "nvs.h"

static const char *TAG = "STATE_MGR";

static action_t last_action = ACTION_NONE;

// 🔑 NVS keys
#define NVS_NAMESPACE "state"
#define KEY_LAST_ACT  "last_action"

void state_manager_init(void)
{
    state_load();
    ESP_LOGI(TAG, "State manager initialized (last_action=%d)", last_action);
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
