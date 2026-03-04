#include "command_verify.h"
#include <mbedtls/md.h>
#include <string.h>
#include <stdio.h>

bool verifyCommandSignature(
    const char* commandId,
    const char* deviceId,
    const char* action,
    const char* issuedAt,
    const char* signature,
    const char* secret
) {
    char data[256];

    snprintf(
        data,
        sizeof(data),
        "%s|%s|%s|%s",
        commandId,
        deviceId,
        action,
        issuedAt
    );

    unsigned char hmac[32];
    mbedtls_md_context_t ctx;

    mbedtls_md_init(&ctx);
    mbedtls_md_setup(
        &ctx,
        mbedtls_md_info_from_type(MBEDTLS_MD_SHA256),
        1
    );

    mbedtls_md_hmac_starts(
        &ctx,
        (const unsigned char*)secret,
        strlen(secret)
    );

    mbedtls_md_hmac_update(
        &ctx,
        (const unsigned char*)data,
        strlen(data)
    );

    mbedtls_md_hmac_finish(&ctx, hmac);
    mbedtls_md_free(&ctx);

    char hex[65];
    for (int i = 0; i < 32; i++) {
        sprintf(hex + (i * 2), "%02x", hmac[i]);
    }
    hex[64] = '\0';

    return strcasecmp(signature, hex) == 0;
}
