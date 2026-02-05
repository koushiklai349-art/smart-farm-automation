#ifndef CONFIG_H
#define CONFIG_H

// -------- BUILD MODE --------
#define DEV_MODE        1   // 1 = dev / simulation
#define MQTT_ENABLED    1   // 0 = disable mqtt safely
#define ACTUATOR_DRY_RUN   1   // 1 = simulate, 0 = real GPIO
#define SELF_TEST_MODE   1

// ===== SIMULATION / STRESS FLAGS =====
#define SIM_SENSOR_FAULTS     1   // random sensor failure
#define SIM_ALERT_STORM       0   // repeated alarms
#define SIM_TIME_COMPRESS     0   // faster loop timing

// -------- TIMING --------
#define TELEMETRY_INTERVAL_MS  10000

// ===== Firmware Identity =====
#define FW_NAME        "ESP32_SMART_FARM"
#define FW_VERSION     "1.0.0"
#define FW_BUILD_DATE  __DATE__
#define FW_BUILD_TIME  __TIME__

#endif
