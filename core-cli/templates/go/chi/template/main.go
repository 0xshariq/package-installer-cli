package main

import (
	"net/http"
	"chi-starter/routes"
)

func main() {
	http.ListenAndServe(":3000", routes.Router())
}
