#pragma once
#include <stdbool.h>

bool verifyCommandSignature(
    const char* commandId,
    const char* deviceId,
    const char* action,
    const char* issuedAt,
    const char* signature,
    const char* secret
);
