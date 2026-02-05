#include "failsafe.h"
#include "esp_system.h"
#include "esp_log.h"

static const char *TAG = "FAILSAFE";

static bool failsafe_active = false;

void failsafe_init(void)
{
    esp_reset_reason_t reason = esp_reset_reason();

    ESP_LOGW(TAG, "Boot reason: %d", reason);

    if (reason == ESP_RST_TASK_WDT ||
        reason == ESP_RST_PANIC   ||
        reason == ESP_RST_BROWNOUT) {

        failsafe_enter();
    }
}

void failsafe_enter(void)
{
    failsafe_active = true;
    ESP_LOGE(TAG, "FAIL-SAFE MODE ACTIVATED 🚨");
}

void failsafe_clear(void)
{
    failsafe_active = false;
    ESP_LOGW(TAG, "FAIL-SAFE CLEARED ✅");
}

bool failsafe_is_active(void)
{
    return failsafe_active;
}
