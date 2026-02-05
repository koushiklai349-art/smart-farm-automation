#include "sensor_driver.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "esp_random.h"
#include "config.h"


static const char *TAG = "SENSOR_FAKE";

static float fake_rand(float min, float max)
{
    int64_t t = esp_timer_get_time();
    uint32_t r = (uint32_t)(t ^ (t >> 32));
    return min + (r % 1000) * (max - min) / 1000.0f;
}

bool sensor_driver_init(void)
{
    ESP_LOGI(TAG, "Fake sensor driver init");
    return true;
}

bool sensor_driver_read(sensor_data_t *out)
{

    if (!out) return false;

    out->temperature   = fake_rand(20.0f, 35.0f);
    out->humidity      = fake_rand(40.0f, 80.0f);
    out->soil_moisture = fake_rand(30.0f, 80.0f);

#if DEV_MODE
    ESP_LOGI(TAG,
        "[FAKE] T=%.2f H=%.2f Soil=%.2f",
        out->temperature,
        out->humidity,
        out->soil_moisture
    );
#endif

#if SIM_SENSOR_FAULTS
    if ((esp_random() % 20) == 0) {
        ESP_LOGW(TAG, "[SIM] Injecting SENSOR FAULT");
        out->soil_moisture = -1;   // invalid value
    }
#endif

    return true;
}
