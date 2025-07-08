from fastapi import FastAPI
from database import get_db
app = FastAPI()


@app.get("/")
async def root():
    db = get_db()
    return {"message": "Hello World"}