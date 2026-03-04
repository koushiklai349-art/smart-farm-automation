#include "nvs.h"
#include "nvs_flash.h"

#define NVS_NAMESPACE "recovery"
#define KEY_ACTIVE    "active"

static bool recovery_active = false;

void recovery_manager_init(void)
{
    nvs_handle_t nvs;
    uint8_t flag = 0;

    if (nvs_open(NVS_NAMESPACE, NVS_READONLY, &nvs) == ESP_OK) {
        nvs_get_u8(nvs, KEY_ACTIVE, &flag);
        nvs_close(nvs);
    }

    recovery_active = (flag == 1);
    ESP_LOGI(TAG, "Recovery manager initialized (active=%d)", recovery_active);
}

void recovery_trigger(const char *reason)
{
    if (!recovery_active) {
        nvs_handle_t nvs;
        if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &nvs) == ESP_OK) {
            nvs_set_u8(nvs, KEY_ACTIVE, 1);
            nvs_commit(nvs);
            nvs_close(nvs);
        }

        recovery_active = true;
        ESP_LOGE(TAG, "🚨 RECOVERY MODE ACTIVATED (%s)", reason);
    }
}

void recovery_clear(void)
{
    nvs_handle_t nvs;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &nvs) == ESP_OK) {
        nvs_set_u8(nvs, KEY_ACTIVE, 0);
        nvs_commit(nvs);
        nvs_close(nvs);
    }

    recovery_active = false;
    ESP_LOGW(TAG, "♻️ Recovery mode cleared");
}
