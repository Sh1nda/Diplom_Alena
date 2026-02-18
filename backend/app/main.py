from fastapi import FastAPI
from app.routers import auth, rooms, bookings, availability, import_data



app = FastAPI(title="Scheduling System")

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(availability.router)
app.include_router(import_data.router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
