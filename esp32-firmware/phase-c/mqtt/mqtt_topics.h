#pragma once

// Device → Backend
#define TOPIC_REGISTER   "farm/%s/device/%s/register"
#define TOPIC_HEARTBEAT  "farm/%s/device/%s/heartbeat"
#define TOPIC_ACK        "farm/%s/device/%s/ack"
#define TOPIC_ERROR      "farm/%s/device/%s/error"
#define TOPIC_STATUS     "farm/%s/device/%s/status"

// Backend → Device (LINE-CENTRIC)
#define TOPIC_COMMAND    "farm/%s/line/%s/command"
