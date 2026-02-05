#ifndef SENSOR_FAKE_H
#define SENSOR_FAKE_H

typedef struct {
    float temperature;
    float humidity;
    float soil_moisture;
} sensor_data_t;

sensor_data_t fake_sensor_read(void);

#endif
