package main

import (
	"echo-starter/handlers"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	e.GET("/", handlers.Home)
	e.Logger.Fatal(e.Start(":3000"))
}
