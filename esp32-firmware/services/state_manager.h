#ifndef STATE_MANAGER_H
#define STATE_MANAGER_H

#include <stddef.h>
#include <stdbool.h>
#include "config.h" 

// existing state APIs
void state_manager_init(void);
bool state_should_execute(action_t action);
void state_commit(action_t action);

device_state_t state_manager_get(void);
void state_manager_set(device_state_t state);

// dedupe
bool is_duplicate_command(const char* commandId);
void save_last_command(const char* commandId);

// provisioning / secret
bool is_device_provisioned(void);
bool load_device_secret(char *out, size_t maxLen);

#endif
