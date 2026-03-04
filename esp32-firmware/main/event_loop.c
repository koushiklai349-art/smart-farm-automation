#include "event_loop.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "alert_engine.h"
#include "alert_manager.h"
#include "rule_engine.h"
#include "actuator.h"
#include "telemetry_builder.h"
#include "config.h"
#include "state_manager.h"
#include "debounce.h"
#include "sensor_manager.h"
#include "esp_log.h"
#include "esp_task_wdt.h"
#include "failsafe.h"
#include "heartbeat.h"
#include "mqtt_service.h"

static const char *TAG = "EVENT_LOOP";

static void event_loop_task(void *arg)
{
    ESP_LOGI(TAG, "Control loop task started");

    esp_task_wdt_add(NULL);   // 🐕‍🦺 register this task

    static uint32_t lastHeartbeat = 0;

    while (1)
    {
        // 1️⃣ Sensor read
        sensor_bundle_t bundle = sensor_manager_read();

        if (!sensor_data_is_valid(bundle.avg))
        {
            ESP_LOGE(TAG, "❌ Sensor data invalid! Forcing SAFE MODE");

            failsafe_enter();

            actuator_execute(ACTION_PUMP_OFF);
            actuator_execute(ACTION_FAN_OFF);

            alert_manager_handle(ACTION_ALARM);

            esp_task_wdt_reset();
            vTaskDelay(pdMS_TO_TICKS(TELEMETRY_INTERVAL_MS));
            continue;
        }

        // 2️⃣ Heartbeat timer
        uint32_t now = xTaskGetTickCount() * portTICK_PERIOD_MS;

        if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS)
        {
            heartbeat_send();
            lastHeartbeat = now;
        }

        // 3️⃣ Rule evaluation
        action_t action = evaluate_rules(bundle.avg);
        ESP_LOGI(TAG, "Rule → %s", action_to_string(action));

#if SIM_ALERT_STORM
        ESP_LOGW(TAG, "[SIM] Alert storm test");
        alert_manager_handle(ACTION_ALARM);
        alert_manager_handle(ACTION_ALARM);
        alert_manager_handle(ACTION_ALARM);
        alert_manager_handle(ACTION_ALARM);
#endif

        // 4️⃣ Actuator execution (protected)
        if (!failsafe_is_active())
        {
            if (state_should_execute(action) && debounce_allow(action))
            {
                actuator_execute(action);
                alert_manager_handle(action);
            }
        }
        else
        {
            ESP_LOGW(TAG, "Actuator blocked (FAIL-SAFE MODE)");
        }

        // 5️⃣ Telemetry publish
#if MQTT_ENABLED
        mqtt_publish_telemetry();
#endif

        // 6️⃣ Feed watchdog
        esp_task_wdt_reset();

        // 7️⃣ Single loop delay
        vTaskDelay(pdMS_TO_TICKS(TELEMETRY_INTERVAL_MS));
    }
}

void event_loop_start(void)
{
    ESP_LOGI(TAG, "Event loop started");

    failsafe_init();
    actuator_init();
    alert_engine_init();
    alert_manager_init();
    state_manager_init();
    debounce_init();
    sensor_manager_init();

    xTaskCreate(
        event_loop_task,
        "event_loop_task",
        4096,
        NULL,
        5,
        NULL
    );
}