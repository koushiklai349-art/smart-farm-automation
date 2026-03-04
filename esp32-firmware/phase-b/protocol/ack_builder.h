struct DeviceAck {
  String commandId;
  String deviceId;
  String status;
};
void send_ack(const char* commandId, const char* status) {
    char payload[160];

    snprintf(payload, sizeof(payload),
        "{ \"deviceId\":\"%s\", \"commandId\":\"%s\", \"status\":\"%s\" }",
        DEVICE_ID,
        commandId,
        status
    );

    mqtt_publish(TOPIC_ACK, payload);
}

