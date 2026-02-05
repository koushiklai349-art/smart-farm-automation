#include "system_init.h"
#include "nvs_flash.h"
#include "esp_system.h"
#include "recovery_manager.h"

void system_init(void)
{
    nvs_flash_init();

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
