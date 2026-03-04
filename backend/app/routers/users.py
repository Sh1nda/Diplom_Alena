from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import require_admin
from app.schemas.user import UserCreate, UserOut
from app.models.user import User, UserRole
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(User).all()


@router.post("/", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if data.email:
        exists = db.query(User).filter(User.email == data.email).first()
        if exists:
            raise HTTPException(400, "Email already exists")

    user = User(
        full_name=data.full_name,
        email=data.email,
        role=data.role,
        password_hash=hash_password(data.password) if data.password else None,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}
@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.full_name = data.full_name
    user.email = data.email
    user.role = data.role

    if data.password:
        user.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(user)
    return user
