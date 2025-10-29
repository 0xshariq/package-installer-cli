package main

import (
	"fmt"
	"log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Product struct {
	ID    uint   `gorm:"primaryKey"`
	Name  string
	Price int
}

func main() {
	dsn := "host=localhost user=postgres password=password123 dbname=mydb port=5432 sslmode=disable TimeZone=Asia/Kolkata"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL:", err)
	}

	db.AutoMigrate(&Product{})

	product := Product{Name: "Laptop", Price: 50000}
	db.Create(&product)

	fmt.Println("✅ PostgreSQL connected and product inserted successfully.")
}
