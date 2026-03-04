#include "config.h"

static controller_config_t config;

void config_load(void)
{
    if (!nvs_load_config(&config)) {
        config.mode = MODE_SAFE_IDLE;
    }
}

bool config_is_assigned(void)
{
    return config.assigned;
}
