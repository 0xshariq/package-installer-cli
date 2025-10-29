require 'sequel'

# Connect to MySQL
DB = Sequel.connect(
  adapter: 'mysql2',
  user: 'root',
  password: 'password123',
  host: 'localhost',
  database: 'mydb',
  port: 3306
)

# Define a model
class User < Sequel::Model(:users)
end

# Create table if not exists
DB.create_table?(:users) do
  primary_key :id
  String :name, null: false
  String :email, unique: true
end

# Insert sample data
User.create(name: 'Sharique', email: 'sharique@example.com')

puts "✅ Connected to MySQL and inserted user successfully."
