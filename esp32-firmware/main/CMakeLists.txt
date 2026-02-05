idf_component_register(
    SRCS
        "app_main.c"

        "../services/mqtt_service.c"
        "../services/telemetry_builder.c"
        "../services/sensor_fake.c"
        "../services/rule_engine.c"

    INCLUDE_DIRS
        "."
        "../services"

    REQUIRES
        esp_system
        log
)
