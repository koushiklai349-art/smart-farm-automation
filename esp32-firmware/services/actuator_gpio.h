#ifndef ACTUATOR_GPIO_H
#define ACTUATOR_GPIO_H

#pragma once
#include "rule_engine.h"

/* GPIO MAP (single source of truth) */
#define RELAY_PUMP_GPIO   26
#define RELAY_FAN_GPIO    27
#define BUZZER_GPIO       25

void actuator_gpio_init(void);
void actuator_gpio_execute(action_t action);

#endif
