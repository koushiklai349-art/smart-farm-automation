#ifndef RECOVERY_MANAGER_H
#define RECOVERY_MANAGER_H

#include <stdbool.h>

void recovery_manager_init(void);
void recovery_trigger(const char *reason);
bool recovery_is_active(void);
void recovery_clear(void);

#endif
