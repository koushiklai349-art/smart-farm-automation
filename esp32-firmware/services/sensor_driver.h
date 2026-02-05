#ifndef SENSOR_DRIVER_H
#define SENSOR_DRIVER_H

#include <stdbool.h>

typedef struct {
    float temperature;
    float humidity;
    float soil_moisture;
} sensor_data_t;

// driver lifecycle
bool sensor_driver_init(void);
bool sensor_driver_read(sensor_data_t *out);

#endif
