from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
async def root():
	return {"message": "Hello World"}

class Item(BaseModel):
    pydantic_model_config = {
        "json_schema_extra": {
            "examples": [
                {"name": "Foo", "description": "A very nice Item", "price": 35.4, "tax": 3.2},
                {"name": "Bar", "description": "The best Item", "price": 23.0, "tax": 0.0},
                {"name": "Baz", "description": "The worst Item", "price": 5.5, "tax": 1.1},
            ]
        }
    }
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

@app.post("/items/")
async def create_item(item: Item):
    return item
