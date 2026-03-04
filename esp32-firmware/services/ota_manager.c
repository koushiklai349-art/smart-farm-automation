#include "ota_manager.h"
#include "esp_log.h"
#include "config.h"
#include "recovery_manager.h"
#include "actuator.h"

static const char *TAG = "OTA_MGR";

void ota_manager_init(void)
{
    ESP_LOGI(TAG, "OTA manager initialized");
}

void ota_manager_start(void)
{
#if DEV_MODE
    ESP_LOGW(TAG, "[DEV] OTA requested (simulation only)");
#else
    ESP_LOGW(TAG, "OTA start requested");

    actuator_disable_all();        // 🔒 SAFETY
    recovery_trigger("OTA_START"); // 🔒 mark unsafe state

    // esp_https_ota(&ota_config);
#endif
}
