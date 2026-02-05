#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include "sensor_driver.h"

typedef struct {
    sensor_data_t avg;
    sensor_data_t max;
    sensor_data_t min;
} sensor_bundle_t;

void sensor_manager_init(void);
sensor_bundle_t sensor_manager_read(void);

#endif
