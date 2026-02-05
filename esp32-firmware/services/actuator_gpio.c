#include "actuator_gpio.h"
#include "config.h"
#include "esp_log.h"

#if !ACTUATOR_DRY_RUN
#include "driver/gpio.h"
#endif

static const char *TAG = "ACT_GPIO";

#define RELAY_ON   0
#define RELAY_OFF  1

void actuator_gpio_init(void)
{
#if ACTUATOR_DRY_RUN
    ESP_LOGI(TAG, "Actuator GPIO init skipped (DRY-RUN)");
#else
    gpio_config_t io = {
        .mode = GPIO_MODE_OUTPUT,
        .pin_bit_mask =
            (1ULL << RELAY_PUMP_GPIO) |
            (1ULL << RELAY_FAN_GPIO)  |
            (1ULL << BUZZER_GPIO)
    };

    gpio_config(&io);

    gpio_set_level(RELAY_PUMP_GPIO, RELAY_OFF);
    gpio_set_level(RELAY_FAN_GPIO,  RELAY_OFF);
    gpio_set_level(BUZZER_GPIO,     0);

    ESP_LOGI(TAG, "Actuator GPIO initialized (REAL HW)");
#endif
}

void actuator_gpio_execute(action_t action)
{
#if ACTUATOR_DRY_RUN
    ESP_LOGI(TAG, "[DRY-RUN] Actuator action → %s",
             action_to_string(action));
#else
    switch (action) {

        case ACTION_PUMP_ON:
            gpio_set_level(RELAY_PUMP_GPIO, RELAY_ON);
            break;

        case ACTION_PUMP_OFF:
            gpio_set_level(RELAY_PUMP_GPIO, RELAY_OFF);
            break;

        case ACTION_FAN_ON:
            gpio_set_level(RELAY_FAN_GPIO, RELAY_ON);
            break;

        case ACTION_FAN_OFF:
            gpio_set_level(RELAY_FAN_GPIO, RELAY_OFF);
            break;

        case ACTION_ALARM:
            gpio_set_level(BUZZER_GPIO, 1);
            break;

        case ACTION_NONE:
        default:
            gpio_set_level(BUZZER_GPIO, 0);
            break;
    }
#endif
}
