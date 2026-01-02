package main

import (
	"gin-starter/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	routes.Register(r)
	r.Run(":3000")
}
