#ifndef ACTUATOR_H
#define ACTUATOR_H

#include "rule_engine.h"

// actuator init (future GPIO init hook)
void actuator_init(void);

// execute action from rule_engine
void actuator_execute(action_t action);

#endif
