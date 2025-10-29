package main

import (
	"fmt"
	"log"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	ID    uint   `gorm:"primaryKey"`
	Name  string
	Email string
}

func main() {
	dsn := "root:password123@tcp(127.0.0.1:3306)/mydb?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to MySQL:", err)
	}

	// Auto migrate model
	db.AutoMigrate(&User{})

	// Insert sample data
	user := User{Name: "Sharique", Email: "sharique@example.com"}
	db.Create(&user)

	fmt.Println("✅ MySQL connected and user inserted successfully.")
}
