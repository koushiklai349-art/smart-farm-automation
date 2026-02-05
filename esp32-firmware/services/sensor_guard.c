#include "sensor_guard.h"
#include "esp_log.h"

static const char *TAG = "SENSOR_GUARD";

bool sensor_data_is_valid(sensor_data_t d)
{
    if (d.temperature < -10 || d.temperature > 60) return false;
    if (d.humidity < 0 || d.humidity > 100) return false;
    if (d.soil_moisture < 0 || d.soil_moisture > 100) return false;

    return true;
}
