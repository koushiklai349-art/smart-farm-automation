#include "registration_client.h"
#include "config.h"
#include "state_manager.h"
#include "telemetry_builder.h"

static char controller_id[64] = {0};

void registration_client_start(void)
{
    if (config_has_controller_id()) {
        config_get_controller_id(controller_id);
        return;
    }

    // POST /api/controllers/register
    bool ok = http_register_controller(controller_id);

    if (ok) {
        config_save_controller_id(controller_id);
    }
}
