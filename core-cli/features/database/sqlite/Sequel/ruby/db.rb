require "sequel"
require "dotenv/load"

DB = Sequel.sqlite(ENV["DATABASE_URL"])
DB.create_table :users do
  primary_key :id
  String :name
  String :email, unique: true
  DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
end