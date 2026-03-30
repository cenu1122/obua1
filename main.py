from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"status": "AI Asistent aktivan", "lokacija": "Lukavac", "proizvodnja": "Palete i mašine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
