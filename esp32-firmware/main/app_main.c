#include "config.h"
#include "system_init.h"
#include "event_loop.h"
#include "mqtt_service.h"
#include "esp_log.h"
#include "esp_task_wdt.h"
#include "ota_manager.h"
#include "self_test.h"

#define WDT_TIMEOUT_SEC 10

void app_main(void)
{
    ESP_LOGI("APP", "Smart Farm Firmware Boot");
    ESP_LOGI("APP",
    "FW: %s | Version: %s | Build: %s %s",
    FW_NAME,
    FW_VERSION,
    FW_BUILD_DATE,
    FW_BUILD_TIME
    );

    system_init();          // NVS, WiFi, Time
    ota_manager_init();
#if SELF_TEST_MODE
    ESP_LOGW("APP", "Running SELF TEST...");
    if (!self_test_run()) {
        ESP_LOGE("APP", "SELF TEST FAILED → entering FAILSAFE");
        // এখানে চাইলে future এ failsafe_enter() দিতে পারো
    }
#endif

     // 🐕‍🦺 Task Watchdog init
    esp_task_wdt_init(WDT_TIMEOUT_SEC, true);

    mqtt_service_init();    // ✅ setup client, buffers
    mqtt_service_start();   // ✅ connect + subscribe

    event_loop_start();     // ✅ dispatcher after deps ready

#ifdef DEV_MODE
    ESP_LOGW("APP", "DEV MODE ENABLED");
#endif
}
