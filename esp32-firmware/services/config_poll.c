#include "config_poll.h"
#include "state_manager.h"
#include "config.h"

void config_poll_task(void)
{
    controller_config_t new_config;

    if (http_fetch_config(&new_config)) {
        config_apply(&new_config);
        state_manager_set(STATE_ONLINE);
    }
}
