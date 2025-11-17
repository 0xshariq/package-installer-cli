package main

import (
	"log"
	"os"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type User struct {
	ID   uint   `gorm:"primaryKey"`
	Name string
}

func main() {
	godotenv.Load()

	dbPath := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil { log.Fatal(err) }

	db.AutoMigrate(&User{})

	var users []User
	db.Find(&users)
}
