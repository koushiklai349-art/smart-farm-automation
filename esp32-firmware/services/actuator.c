#include "actuator.h"
#include "actuator_gpio.h"
#include "failsafe.h"
#include "esp_log.h"

static const char *TAG = "ACTUATOR";

static action_t last_action = ACTION_NONE;

void actuator_init(void)
{
    ESP_LOGI(TAG, "Actuator init");
    actuator_gpio_init();
}

void actuator_execute(action_t action)
{
    if (failsafe_is_active()) {
        ESP_LOGW(TAG, "Failsafe active → actuator blocked");
        return;
    }

    if (action == last_action) {
        ESP_LOGI(TAG, "Action %d ignored (no state change)", action);
        return;
    }

    ESP_LOGI(TAG, "Executing action → %d", action);
    actuator_gpio_execute(action);

    last_action = action;
}
