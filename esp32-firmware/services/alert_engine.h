#ifndef ALERT_ENGINE_H
#define ALERT_ENGINE_H

#include "rule_engine.h"

// init alert hardware / simulation
void alert_engine_init(void);

// trigger alert based on action
void alert_engine_handle(action_t action);

#endif
