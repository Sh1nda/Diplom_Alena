from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import require_admin
from app.services.import_schedule import import_schedule_from_xlsx
from app.services.import_assignments import import_assignments_from_docx

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/schedule")
async def import_schedule(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    if not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Expected Excel file")
    content = await file.read()
    import_schedule_from_xlsx(db, content)
    return {"status": "ok"}


@router.post("/assignments")
async def import_assignments(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Expected DOCX file")
    content = await file.read()
    import_assignments_from_docx(db, content)
    return {"status": "ok"}
