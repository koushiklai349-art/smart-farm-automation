#ifndef DEBOUNCE_H
#define DEBOUNCE_H

#include "rule_engine.h"
#include <stdbool.h>

void debounce_init(void);
bool debounce_allow(action_t action);

#endif
