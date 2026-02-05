#include "recovery_manager.h"
#include "esp_log.h"

static const char *TAG = "RECOVERY";

static bool recovery_active = false;

void recovery_manager_init(void)
{
    recovery_active = false;
    ESP_LOGI(TAG, "Recovery manager initialized");
}

void recovery_trigger(const char *reason)
{
    if (!recovery_active) {
        recovery_active = true;
        ESP_LOGE(TAG, "🚨 RECOVERY MODE ACTIVATED (%s)", reason);
    }
}

bool recovery_is_active(void)
{
    return recovery_active;
}

void recovery_clear(void)
{
    recovery_active = false;
    ESP_LOGW(TAG, "♻️ Recovery mode cleared");
}
