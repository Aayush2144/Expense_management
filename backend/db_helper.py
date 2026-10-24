import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from contextlib import contextmanager
import calendar
import mysql.connector

# Ensure backend directory is in sys.path
sys.path.append(str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from logging_setup import setup_logger
except ImportError:
    from backend.logging_setup import setup_logger

logger = setup_logger('db_helper')


def get_db_connection():
    """Create and return a MySQL connection using environment variables or DATABASE_URL."""
    database_url = os.environ.get("DATABASE_URL")
    
    if database_url:
        parsed = urlparse(database_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 3306
        user = parsed.username or "root"
        password = parsed.password or ""
        dbname = parsed.path.lstrip("/") or "expense_manager"
    else:
        host = os.environ.get("DB_HOST", "localhost")
        port = int(os.environ.get("DB_PORT", 3306))
        user = os.environ.get("DB_USER", "root")
        password = os.environ.get("DB_PASSWORD", "root")
        dbname = os.environ.get("DB_NAME", "expense_manager")

    conn_args = {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "database": dbname,
    }

    # SSL configuration for cloud databases (TiDB, Aiven, AWS, etc.)
    ssl_ca = os.environ.get("DB_SSL_CA")
    ssl_disabled = os.environ.get("DB_SSL_DISABLED", "false").lower() in ("true", "1")

    if ssl_ca:
        conn_args["ssl_ca"] = ssl_ca
    elif not ssl_disabled and host not in ("localhost", "127.0.0.1", "backend", "db"):
        # Most cloud-hosted MySQL databases require SSL
        conn_args["ssl_disabled"] = False

    return mysql.connector.connect(**conn_args)


@contextmanager
def get_db_cursor(commit=False):
    """Context manager for obtaining a database cursor with automatic cleanup."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        yield cursor
        if commit:
            connection.commit()
    finally:
        cursor.close()
        connection.close()


def init_db():
    """Ensure the required table exists in the database and seed initial demo data if empty."""
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS expenses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    expense_date DATE NOT NULL,
                    amount FLOAT NOT NULL,
                    category VARCHAR(255) NOT NULL,
                    notes TEXT
                );
            """)
            cursor.execute("SELECT COUNT(*) as count FROM expenses;")
            result = cursor.fetchone()
            if result and result.get('count', 0) == 0:
                sample_data = [
                    ('2024-08-01', 1200.0, 'Rent', 'Monthly rent payment'),
                    ('2024-08-01', 300.0, 'Food', 'Groceries for the week'),
                    ('2024-08-02', 150.0, 'Shopping', 'New shoes'),
                    ('2024-08-02', 80.0, 'Entertainment', 'Concert tickets'),
                    ('2024-08-03', 100.0, 'Food', 'Dinner at a restaurant'),
                    ('2024-08-04', 200.0, 'Shopping', 'Home supplies'),
                    ('2024-08-05', 75.0, 'Entertainment', 'Theater tickets'),
                    ('2024-09-01', 1200.0, 'Rent', 'Monthly rent payment'),
                    ('2024-09-01', 300.0, 'Food', 'Groceries for the week'),
                    ('2024-09-02', 100.0, 'Shopping', 'Clothes'),
                    ('2024-09-03', 60.0, 'Food', 'Dinner at a restaurant'),
                ]
                cursor.executemany(
                    "INSERT INTO expenses (expense_date, amount, category, notes) VALUES (%s, %s, %s, %s)",
                    sample_data
                )
                logger.info("Sample expense records inserted into database.")
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error during init_db: {e}")


def fetch_expenses_for_date(expense_date):
    logger.info(f"fetch_expenses_for_date called with {expense_date}")
    with get_db_cursor() as cursor:
        cursor.execute("SELECT * FROM expenses WHERE expense_date = %s", (expense_date,))
        expenses = cursor.fetchall()
        return expenses


def delete_expenses_for_date(expense_date):
    logger.info(f"delete_expenses_for_date called with {expense_date}")
    with get_db_cursor(commit=True) as cursor:
        cursor.execute("DELETE FROM expenses WHERE expense_date = %s", (expense_date,))


def insert_expense(expense_date, amount, category, notes):
    logger.info(f"insert_expense called with date: {expense_date}, amount: {amount}, category: {category}, notes: {notes}")
    with get_db_cursor(commit=True) as cursor:
        cursor.execute(
            "INSERT INTO expenses (expense_date, amount, category, notes) VALUES (%s, %s, %s, %s)",
            (expense_date, amount, category, notes)
        )


def fetch_expense_summary(start_date, end_date):
    logger.info(f"fetch_expense_summary called with start: {start_date} end: {end_date}")
    with get_db_cursor() as cursor:
        cursor.execute(
            '''SELECT category, SUM(amount) as total 
               FROM expenses WHERE expense_date
               BETWEEN %s and %s  
               GROUP BY category;''',
            (start_date, end_date)
        )
        data = cursor.fetchall()
        results = []
        for row in data:
            results.append({
                'category': row['category'],
                'total': float(row['total']) if row['total'] is not None else 0.0
            })
        return results


def fetch_expense_summary_by_month(year: int):
    """
    Fetches total expenses grouped by month for a given year.
    Returns a list of dicts: [{'month': 'January', 'total': 5000.0}, ...]
    """
    logger.info(f"fetch_expense_summary_by_month called with year: {year}")
    with get_db_cursor() as cursor:
        cursor.execute(
            '''
            SELECT MONTH(expense_date) as month_num,
                   SUM(amount) as total
            FROM expenses
            WHERE YEAR(expense_date) = %s
            GROUP BY month_num
            ORDER BY month_num;
            ''',
            (year,)
        )
        rows = cursor.fetchall()

        results = []
        for row in rows:
            month_num = int(row['month_num'])
            month_name = calendar.month_name[month_num]
            total_val = float(row['total']) if row['total'] is not None else 0.0
            results.append({'month': month_name, 'total': total_val})

        return results


if __name__ == "__main__":
    init_db()
    expenses = fetch_expenses_for_date("2024-09-30")
    print("Expenses for 2024-09-30:", expenses)
    summary = fetch_expense_summary("2024-08-01", "2024-08-05")
    for record in summary:
        print(record)
