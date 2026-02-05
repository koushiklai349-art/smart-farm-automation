#ifndef RULE_ENGINE_H
#define RULE_ENGINE_H

#include "sensor_fake.h"

typedef enum {
    ACTION_NONE = 0,
    ACTION_PUMP_ON,
    ACTION_PUMP_OFF,
    ACTION_FAN_ON,
    ACTION_FAN_OFF,
    ACTION_ALARM
} action_t;

action_t evaluate_rules(sensor_data_t data);

const char *action_to_string(action_t action);

#endif
