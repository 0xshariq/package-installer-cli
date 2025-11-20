#include <ulfius.h>
#include <stdio.h>


int callback_hello(const struct _u_request *req, struct _u_response *resp, void *userdata) {
const char *name = u_map_get(req->map_url, "name");
char body[256];
snprintf(body, sizeof(body), "Hello, %s", name ? name : "guest");
ulfius_set_string_body_response(resp, 200, body);
return U_CALLBACK_CONTINUE;
}


int main() {
struct _u_instance instance;


if (ulfius_init_instance(&instance, 8080, NULL, NULL) != U_OK) {
printf("Error initializing instance\n");
return 1;
}


ulfius_add_endpoint_by_val(&instance, "GET", "/", NULL, 0,
[](const struct _u_request *req, struct _u_response *resp, void *ud){
ulfius_set_string_body_response(resp, 200, "Ulfius Starter Running");
return U_CALLBACK_CONTINUE;
},
NULL);


ulfius_add_endpoint_by_val(&instance, "GET", "/hello/", ":name", 0, callback_hello, NULL);


if (ulfius_start_framework(&instance) == U_OK) {
printf("Ulfius server on http://localhost:8080\n");
getchar();
} else {
printf("Error starting Ulfius framework\n");
}


ulfius_stop_framework(&instance);
ulfius_clean_instance(&instance);


return 0;
}