#include "alert_engine.h"
#include "esp_log.h"
#include "config.h"

static const char *TAG = "ALERT_ENGINE";

void alert_engine_init(void)
{
#if DEV_MODE
    ESP_LOGI(TAG, "Alert engine init (DEV_MODE - simulation)");
#else
    ESP_LOGI(TAG, "Alert engine init (HW MODE)");
    // TODO:
    // gpio_config() for buzzer / alarm relay
#endif
}

void alert_engine_handle(action_t action)
{
    if (action != ACTION_ALARM) {
        return;
    }

#if DEV_MODE
    ESP_LOGW(TAG, "[SIM ALERT] 🚨 ALARM TRIGGERED");
#else
    ESP_LOGW(TAG, "[HW ALERT] 🚨 BUZZER / RELAY ON");
    // TODO:
    // gpio_set_level(ALERT_GPIO, 1);
#endif
}
