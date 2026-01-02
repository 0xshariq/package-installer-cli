package routes

import (
	"gin-starter/handlers"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine) {
	r.GET("/", handlers.Health)
}
