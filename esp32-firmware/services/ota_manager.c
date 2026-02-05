#include "ota_manager.h"
#include "esp_log.h"
#include "config.h"

static const char *TAG = "OTA_MGR";

void ota_manager_init(void)
{
    ESP_LOGI(TAG, "OTA manager initialized");
}

void ota_manager_start(void)
{
#if DEV_MODE
    ESP_LOGW(TAG, "[DEV] OTA requested (simulation only)");
    ESP_LOGI(TAG, "[DEV] Download → Verify → Flash → Reboot (SKIPPED)");
#else
    ESP_LOGW(TAG, "OTA start requested");
    // TODO (future):
    // esp_https_ota(&ota_config);
#endif
}
