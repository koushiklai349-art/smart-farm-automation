#include "rule_engine.h"
#include "esp_log.h"

static const char *TAG = "RULE_ENGINE";

action_t evaluate_rules(sensor_data_t data)
{
    ESP_LOGI(TAG,
        "Rules: T=%.2f H=%.2f Soil=%.2f",
        data.temperature,
        data.humidity,
        data.soil_moisture
    );

    /* 🚨 Highest priority: alarm conditions */
    if (data.humidity < 30.0f) {
        return ACTION_ALARM;
    }

    /* 💧 Pump logic */
    if (data.soil_moisture < 40.0f) {
        return ACTION_PUMP_ON;
    }

    if (data.soil_moisture > 60.0f) {
        return ACTION_PUMP_OFF;
    }

    /* 🌬 Fan logic */
    if (data.temperature > 32.0f) {
        return ACTION_FAN_ON;
    }

    if (data.temperature < 28.0f) {
        return ACTION_FAN_OFF;
    }

    return ACTION_NONE;
}
