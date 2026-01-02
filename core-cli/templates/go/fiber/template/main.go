package main

import (
	"fiber-starter/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()
	routes.Register(app)
	app.Listen(":3000")
}
