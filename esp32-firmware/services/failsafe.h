#ifndef FAILSAFE_H
#define FAILSAFE_H

#include <stdbool.h>

void failsafe_init(void);
bool failsafe_is_active(void);
void failsafe_enter(void);

#endif
