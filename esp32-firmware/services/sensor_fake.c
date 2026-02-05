#include "sensor_guard.h"
#include "esp_log.h"
#include <math.h>

static const char *TAG = "SENSOR_GUARD";

#define TEMP_MIN   5.0f
#define TEMP_MAX   60.0f
#define SOIL_MIN   0.0f
#define SOIL_MAX   100.0f
#define HUM_MIN    0.0f
#define HUM_MAX    100.0f

#define MAX_TEMP_JUMP   10.0f
#define MAX_SOIL_JUMP   20.0f

static sensor_data_t last_valid = {0};
static bool has_last = false;

bool sensor_data_is_valid(sensor_data_t data)
{
    if (data.temperature < TEMP_MIN || data.temperature > TEMP_MAX)
        return false;

    if (data.humidity < HUM_MIN || data.humidity > HUM_MAX)
        return false;

    if (data.soil_moisture < SOIL_MIN || data.soil_moisture > SOIL_MAX)
        return false;

    if (has_last) {
        if (fabsf(data.temperature - last_valid.temperature) > MAX_TEMP_JUMP)
            return false;

        if (fabsf(data.soil_moisture - last_valid.soil_moisture) > MAX_SOIL_JUMP)
            return false;
    }

    last_valid = data;
    has_last = true;

    return true;
}
