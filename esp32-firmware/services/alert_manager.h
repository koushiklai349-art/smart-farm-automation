#ifndef ALERT_MANAGER_H
#define ALERT_MANAGER_H

#include "rule_engine.h"

void alert_manager_init(void);
void alert_handle(action_t action);

#endif
