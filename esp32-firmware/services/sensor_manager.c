#include "sensor_manager.h"
#include "sensor_driver.h"
#include "esp_log.h"

static const char *TAG = "SENSOR_MGR";

#define SENSOR_COUNT 3

void sensor_manager_init(void)
{
    ESP_LOGI(TAG, "Sensor manager init (%d sensors)", SENSOR_COUNT);
    sensor_driver_init();
}

sensor_bundle_t sensor_manager_read(void)
{
    sensor_bundle_t bundle = {0};
    sensor_data_t sensors[SENSOR_COUNT];

    for (int i = 0; i < SENSOR_COUNT; i++) {
        sensor_driver_read(&sensors[i]);
    }

    bundle.min = sensors[0];
    bundle.max = sensors[0];

    for (int i = 0; i < SENSOR_COUNT; i++) {
        bundle.avg.temperature   += sensors[i].temperature;
        bundle.avg.humidity      += sensors[i].humidity;
        bundle.avg.soil_moisture += sensors[i].soil_moisture;

        if (sensors[i].temperature < bundle.min.temperature)
            bundle.min.temperature = sensors[i].temperature;
        if (sensors[i].temperature > bundle.max.temperature)
            bundle.max.temperature = sensors[i].temperature;

        if (sensors[i].humidity < bundle.min.humidity)
            bundle.min.humidity = sensors[i].humidity;
        if (sensors[i].humidity > bundle.max.humidity)
            bundle.max.humidity = sensors[i].humidity;

        if (sensors[i].soil_moisture < bundle.min.soil_moisture)
            bundle.min.soil_moisture = sensors[i].soil_moisture;
        if (sensors[i].soil_moisture > bundle.max.soil_moisture)
            bundle.max.soil_moisture = sensors[i].soil_moisture;
    }

    bundle.avg.temperature   /= SENSOR_COUNT;
    bundle.avg.humidity      /= SENSOR_COUNT;
    bundle.avg.soil_moisture /= SENSOR_COUNT;

    ESP_LOGI(TAG,
        "AVG T=%.2f H=%.2f Soil=%.2f",
        bundle.avg.temperature,
        bundle.avg.humidity,
        bundle.avg.soil_moisture
    );

    return bundle;
}
