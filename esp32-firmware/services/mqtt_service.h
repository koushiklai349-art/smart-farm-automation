#ifndef MQTT_SERVICE_H
#define MQTT_SERVICE_H

void mqtt_service_init(void);
void mqtt_service_start(void); 
void mqtt_publish_telemetry(void);
void mqtt_handle_incoming(const char *payload);

#endif
