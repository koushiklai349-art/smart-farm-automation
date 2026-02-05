typedef enum {
    STATE_BOOTING,
    STATE_RUNNING,
    STATE_ERROR,
    STATE_SAFE
} device_state_t;

void device_state_set(device_state_t new_state);
device_state_t device_state_get(void);
