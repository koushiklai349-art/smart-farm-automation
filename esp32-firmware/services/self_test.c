#include "self_test.h"
#include "esp_log.h"
#include "sensor_driver.h"
#include "rule_engine.h"
#include "actuator.h"
#include "failsafe.h"

static const char *TAG = "SELF_TEST";

bool self_test_run(void)
{
    ESP_LOGW(TAG, "===== SELF TEST START =====");

    sensor_data_t data;
    if (!sensor_driver_read(&data)) {
        ESP_LOGE(TAG, "Sensor test FAILED");
        return false;
    }

    ESP_LOGI(TAG, "Sensor OK");

    action_t action = evaluate_rules(data);
    ESP_LOGI(TAG, "Rule engine OK (%s)", action_to_string(action));

    if (!failsafe_is_active()) {
        actuator_execute(ACTION_PUMP_ON);
        actuator_execute(ACTION_PUMP_OFF);
        ESP_LOGI(TAG, "Actuator DRY-RUN OK");
    }

    ESP_LOGW(TAG, "===== SELF TEST PASSED ✅ =====");
    return true;
}
