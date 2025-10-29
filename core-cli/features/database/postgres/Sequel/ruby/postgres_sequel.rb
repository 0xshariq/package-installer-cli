require 'sequel'

# Connect to PostgreSQL
DB = Sequel.connect(
  adapter: 'postgres',
  user: 'postgres',
  password: 'password123',
  host: 'localhost',
  database: 'mydb',
  port: 5432
)

# Define a model
class Product < Sequel::Model(:products)
end

# Create table if not exists
DB.create_table?(:products) do
  primary_key :id
  String :name, null: false
  Integer :price
end

# Insert sample data
Product.create(name: 'Laptop', price: 50000)

puts "✅ Connected to PostgreSQL and inserted product successfully."
