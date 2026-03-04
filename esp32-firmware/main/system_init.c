#include "system_init.h"
#include "nvs_flash.h"
#include "esp_system.h"
#include "recovery_manager.h"
#include "state_manager.h"
#include "config.h"
#include "mqtt_service.h"
#include "command_handler.h"

void system_init(void)
{
    nvs_flash_init();        // 🔑 FIRST
    state_manager_init();    // now safe
    command_handler_init();
    mqtt_service_init();
   
    recovery_manager_init();

    esp_reset_reason_t reason = esp_reset_reason();

    switch (reason) {
case ESP_RST_WDT:
    recovery_trigger("WATCHDOG RESET");
    break;

case ESP_RST_PANIC:
    recovery_trigger("PANIC RESET");
    break;

case ESP_RST_POWERON:
default:
    recovery_clear();
    break;
}
}
