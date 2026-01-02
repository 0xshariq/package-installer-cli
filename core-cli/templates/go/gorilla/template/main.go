package main

import (
	"gorilla-starter/handlers"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/", handlers.Home).Methods("GET")

	log.Println("Server running on :3000")
	http.ListenAndServe(":3000", r)
}
