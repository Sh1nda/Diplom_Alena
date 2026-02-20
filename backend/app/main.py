from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, rooms, bookings, availability, import_data
from app.routers import schedule
from app.routers import schedule, schedule_week
app = FastAPI(title="Scheduling System")

# CORS — обязательно для фронта
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # можно указать ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(availability.router)
app.include_router(import_data.router)
app.include_router(schedule.router)
app.include_router(schedule_week.router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
