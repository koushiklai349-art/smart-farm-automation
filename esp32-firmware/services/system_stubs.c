#include "esp_log.h"

static const char *TAG = "STUBS";

void system_init(void)
{
    ESP_LOGW(TAG, "system_init() stub");
}

void ota_manager_init(void)
{
    ESP_LOGW(TAG, "ota_manager_init() stub");
}

void self_test_run(void)
{
    ESP_LOGW(TAG, "self_test_run() stub");
}

void event_loop_start(void)
{
    ESP_LOGW(TAG, "event_loop_start() stub");
}
