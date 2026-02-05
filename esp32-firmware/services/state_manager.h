#ifndef STATE_MANAGER_H
#define STATE_MANAGER_H

#include "rule_engine.h"
#include <stdbool.h>

void state_manager_init(void);
bool state_should_execute(action_t action);

void state_save(void);
void state_load(void);

#endif
