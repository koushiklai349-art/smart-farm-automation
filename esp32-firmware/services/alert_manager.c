#include "alert_manager.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "failsafe.h"

static const char *TAG = "ALERT_MGR";

static int alert_count = 0;
static int64_t first_alert_time = 0;

#define ALERT_WINDOW_US   (60 * 1000 * 1000)   // 60 sec
#define CRITICAL_LIMIT    3
#define FAILSAFE_LIMIT    5

void alert_manager_init(void)
{
    alert_count = 0;
    first_alert_time = 0;
    ESP_LOGI(TAG, "Alert manager initialized");
}

void alert_manager_handle(action_t action)

{
    if (action != ACTION_ALARM) return;

    int64_t now = esp_timer_get_time();

    if (first_alert_time == 0 ||
        (now - first_alert_time) > ALERT_WINDOW_US) {
        first_alert_time = now;
        alert_count = 0;
    }

    alert_count++;

    
if (alert_count >= FAILSAFE_LIMIT) {
    ESP_LOGE(TAG, "🔥 FAILSAFE ALERT TRIGGERED");
    failsafe_enter();
}
    else if (alert_count >= CRITICAL_LIMIT) {
        ESP_LOGW(TAG, "🚨 CRITICAL ALERT");
        // future: buzzer ON
    }
    else {
        ESP_LOGI(TAG, "⚠️ WARN alert");
    }
}
