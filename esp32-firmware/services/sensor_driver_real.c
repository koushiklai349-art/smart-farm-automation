#include "sensor_driver.h"
#include "esp_log.h"

static const char *TAG = "SENSOR_REAL";

bool sensor_driver_init(void)
{
    ESP_LOGW(TAG, "Real sensor driver not implemented yet");
    return false;
}

bool sensor_driver_read(sensor_data_t *out)
{
    (void)out;
    return false;
}
