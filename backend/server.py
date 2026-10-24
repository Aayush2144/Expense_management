import sys
from pathlib import Path
from datetime import date
from typing import List, Optional

# Ensure backend directory is in sys.path
sys.path.append(str(Path(__file__).parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import db_helper
except ImportError:
    from backend import db_helper

app = FastAPI(title="Expense Management API", version="1.0.0")

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    try:
        db_helper.init_db()
    except Exception as e:
        print(f"Startup notice: Could not auto-initialize DB: {e}")


class Expense(BaseModel):
    amount: float
    category: str
    notes: Optional[str] = ""


class DateRange(BaseModel):
    start_date: date
    end_date: date


class YearRequest(BaseModel):
    year: int


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Expense Management API",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    try:
        with db_helper.get_db_cursor() as cursor:
            cursor.execute("SELECT 1;")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database_error": str(e)}


@app.get("/expenses/{expense_date}", response_model=List[Expense])
def get_expenses(expense_date: date):
    try:
        expenses = db_helper.fetch_expenses_for_date(expense_date)
        if expenses is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve expenses from database.")
        return expenses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/expenses/{expense_date}")
def add_or_update_expense(expense_date: date, expenses: List[Expense]):
    try:
        db_helper.delete_expenses_for_date(expense_date)
        for expense in expenses:
            db_helper.insert_expense(expense_date, expense.amount, expense.category, expense.notes or "")
        return {"message": "Expenses updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update error: {str(e)}")


@app.post("/analytics/")
def get_analytics(date_range: DateRange):
    try:
        data = db_helper.fetch_expense_summary(date_range.start_date, date_range.end_date)
        if data is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve expense summary from the database.")

        total = sum([row['total'] for row in data])

        breakdown = {}
        for row in data:
            percentage = (row['total'] / total) * 100 if total != 0 else 0
            breakdown[row['category']] = {
                "total": row['total'],
                "percentage": percentage
            }

        return breakdown
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")


@app.post("/analytics/monthly/")
def get_monthly_analytics(year_req: YearRequest):
    try:
        year = year_req.year
        data = db_helper.fetch_expense_summary_by_month(year)
        if data is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve monthly expense summary from the database.")

        total = sum([row['total'] for row in data])

        breakdown = {}
        for row in data:
            percentage = (row['total'] / total) * 100 if total != 0 else 0
            breakdown[row['month']] = {
                "total": row['total'],
                "percentage": percentage
            }

        return breakdown
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monthly analytics error: {str(e)}")
