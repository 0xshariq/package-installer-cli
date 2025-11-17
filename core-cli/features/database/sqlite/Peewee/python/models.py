from peewee import *
from .db import db

class User(Model):
    name = CharField()
    email = CharField(unique=True)
    created_at = DateTimeField(constraints=[SQL('DEFAULT CURRENT_TIMESTAMP')])

    class Meta:
        database = db
        table_name = 'users'
