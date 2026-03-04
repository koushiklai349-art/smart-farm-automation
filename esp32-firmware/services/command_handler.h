#ifndef COMMAND_HANDLER_H
#define COMMAND_HANDLER_H

void handle_command_json(const char *json);
void send_ack(const char* commandId, const char* status);

#endif
