#include "debounce.h"
#include "esp_timer.h"
#include "esp_log.h"

static const char *TAG = "DEBOUNCE";

// last execution time per action
static int64_t last_exec_us[ACTION_ALARM + 1];

// cooldown (microseconds)
#define COOLDOWN_US   (10 * 1000 * 1000)   // 10 sec

void debounce_init(void)
{
    for (int i = 0; i <= ACTION_ALARM; i++) {
        last_exec_us[i] = 0;
    }
    ESP_LOGI(TAG, "Debounce initialized (cooldown=%d sec)", 10);
}

bool debounce_allow(action_t action)
{
    if (action == ACTION_NONE) return false;

    int64_t now = esp_timer_get_time();

    if ((now - last_exec_us[action]) < COOLDOWN_US) {
        ESP_LOGI(TAG,
            "Action %d blocked (cooldown active)", action);
        return false;
    }

    last_exec_us[action] = now;
    return true;
}

