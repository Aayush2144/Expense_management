import os
import sys
import sqlite3
import calendar
from pathlib import Path
from urllib.parse import urlparse, unquote
from contextlib import contextmanager

# Ensure backend directory is in sys.path
sys.path.append(str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import mysql.connector
except ImportError:
    mysql = None

try:
    import certifi
except ImportError:
    certifi = None

try:
    from logging_setup import setup_logger
except ImportError:
    from backend.logging_setup import setup_logger

logger = setup_logger('db_helper')

SQLITE_PATH = Path(__file__).parent / "expense_manager.db"
_ACTIVE_ENGINE = None


def get_mysql_connection():
    """Create a MySQL connection using env variables or DATABASE_URL."""
    if mysql is None:
        raise RuntimeError("mysql-connector-python is not installed")

    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        database_url = database_url.strip("'\" \t\r\n")
        parsed = urlparse(database_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 3306
        user = unquote(parsed.username) if parsed.username else "root"
        password = unquote(parsed.password) if parsed.password else ""
        dbname = parsed.path.lstrip("/").split("?")[0] or "expense_manager"
    else:
        host = os.environ.get("DB_HOST", "localhost").strip("'\" \t\r\n")
        port_raw = str(os.environ.get("DB_PORT", 3306)).strip("'\" \t\r\n")
        port = int(port_raw) if port_raw.isdigit() else 3306
        user = os.environ.get("DB_USER", "root").strip("'\" \t\r\n")
        password = os.environ.get("DB_PASSWORD", "root").strip("'\" \t\r\n")
        dbname = os.environ.get("DB_NAME", "test").strip("'\" \t\r\n")

    conn_args = {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "database": dbname,
        "connection_timeout": 5,
    }

    ssl_ca = os.environ.get("DB_SSL_CA")
    ssl_disabled = os.environ.get("DB_SSL_DISABLED", "false").lower() in ("true", "1")

    if not ssl_disabled and host not in ("localhost", "127.0.0.1", "backend", "db"):
        if ssl_ca:
            conn_args["ssl_ca"] = ssl_ca.strip("'\" \t\r\n")
        elif certifi:
            conn_args["ssl_ca"] = certifi.where()
        elif os.path.exists("/etc/ssl/certs/ca-certificates.crt"):
            conn_args["ssl_ca"] = "/etc/ssl/certs/ca-certificates.crt"
        else:
            conn_args["ssl_disabled"] = False

    return mysql.connector.connect(**conn_args)


def get_engine():
    """Determine whether to use MySQL or SQLite fallback."""
    global _ACTIVE_ENGINE
    if _ACTIVE_ENGINE is not None:
        return _ACTIVE_ENGINE

    if os.environ.get("USE_SQLITE", "false").lower() in ("true", "1", "yes"):
        logger.info("USE_SQLITE is set. Using SQLite database.")
        _ACTIVE_ENGINE = "sqlite"
        return _ACTIVE_ENGINE

    # Try connecting to MySQL
    try:
        conn = get_mysql_connection()
        conn.close()
        _ACTIVE_ENGINE = "mysql"
        logger.info("Successfully connected to MySQL database.")
    except Exception as e:
        logger.warning(f"Could not connect to MySQL ({e}). Seamlessly falling back to local SQLite.")
        _ACTIVE_ENGINE = "sqlite"

    return _ACTIVE_ENGINE


def get_sqlite_connection():
    """Return an SQLite connection with Row factory."""
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db_cursor(commit=False):
    """Context manager for obtaining a database cursor for the active engine."""
    engine = get_engine()
    if engine == "mysql":
        connection = get_mysql_connection()
        cursor = connection.cursor(dictionary=True)
        try:
            yield cursor, "mysql"
            if commit:
                connection.commit()
        finally:
            cursor.close()
            connection.close()
    else:
        connection = get_sqlite_connection()
        cursor = connection.cursor()
        try:
            yield cursor, "sqlite"
            if commit:
                connection.commit()
        finally:
            cursor.close()
            connection.close()


def init_db():
    """Ensure table exists and seed starter data if empty on the active database."""
    engine = get_engine()
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

    try:
        with get_db_cursor(commit=True) as (cursor, eng):
            if eng == "mysql":
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
                res = cursor.fetchone()
                if res and res.get('count', 0) == 0:
                    cursor.executemany(
                        "INSERT INTO expenses (expense_date, amount, category, notes) VALUES (%s, %s, %s, %s)",
                        sample_data
                    )
                    logger.info("Sample records inserted into MySQL.")
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS expenses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        expense_date TEXT NOT NULL,
                        amount REAL NOT NULL,
                        category TEXT NOT NULL,
                        notes TEXT
                    );
                """)
                cursor.execute("SELECT COUNT(*) as count FROM expenses;")
                res = cursor.fetchone()
                if res and res['count'] == 0:
                    cursor.executemany(
                        "INSERT INTO expenses (expense_date, amount, category, notes) VALUES (?, ?, ?, ?)",
                        sample_data
                    )
                    logger.info("Sample records inserted into SQLite.")
        logger.info(f"Database ({engine}) initialized successfully.")
    except Exception as e:
        logger.error(f"Error during init_db: {e}")


def fetch_expenses_for_date(expense_date):
    """Fetch expenses for a specific date."""
    logger.info(f"fetch_expenses_for_date called with {expense_date}")
    with get_db_cursor() as (cursor, eng):
        if eng == "mysql":
            cursor.execute("SELECT * FROM expenses WHERE expense_date = %s", (str(expense_date),))
            rows = cursor.fetchall()
            return rows
        else:
            cursor.execute("SELECT * FROM expenses WHERE expense_date = ?", (str(expense_date),))
            rows = [dict(r) for r in cursor.fetchall()]
            return rows


def delete_expenses_for_date(expense_date):
    """Delete expenses for a specific date."""
    logger.info(f"delete_expenses_for_date called with {expense_date}")
    with get_db_cursor(commit=True) as (cursor, eng):
        placeholder = "%s" if eng == "mysql" else "?"
        cursor.execute(f"DELETE FROM expenses WHERE expense_date = {placeholder}", (str(expense_date),))


def insert_expense(expense_date, amount, category, notes):
    """Insert an expense record."""
    logger.info(f"insert_expense called with date: {expense_date}, amount: {amount}, category: {category}")
    with get_db_cursor(commit=True) as (cursor, eng):
        if eng == "mysql":
            cursor.execute(
                "INSERT INTO expenses (expense_date, amount, category, notes) VALUES (%s, %s, %s, %s)",
                (str(expense_date), amount, category, notes)
            )
        else:
            cursor.execute(
                "INSERT INTO expenses (expense_date, amount, category, notes) VALUES (?, ?, ?, ?)",
                (str(expense_date), amount, category, notes)
            )


def fetch_expense_summary(start_date, end_date):
    """Fetch summary totals grouped by category."""
    logger.info(f"fetch_expense_summary called with {start_date} to {end_date}")
    with get_db_cursor() as (cursor, eng):
        placeholder = "%s" if eng == "mysql" else "?"
        cursor.execute(
            f'''SELECT category, SUM(amount) as total 
               FROM expenses WHERE expense_date
               BETWEEN {placeholder} and {placeholder}  
               GROUP BY category;''',
            (str(start_date), str(end_date))
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
    """Fetch total expenses grouped by month for a given year."""
    logger.info(f"fetch_expense_summary_by_month called with year: {year}")
    with get_db_cursor() as (cursor, eng):
        if eng == "mysql":
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
        else:
            cursor.execute(
                '''
                SELECT CAST(strftime('%m', expense_date) AS INTEGER) as month_num,
                       SUM(amount) as total
                FROM expenses
                WHERE strftime('%Y', expense_date) = ?
                GROUP BY month_num
                ORDER BY month_num;
                ''',
                (str(year),)
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
    expenses = fetch_expenses_for_date("2024-08-01")
    print("Expenses for 2024-08-01:", expenses)
    summary = fetch_expense_summary("2024-08-01", "2024-08-05")
    print("Summary:", summary)
    monthly = fetch_expense_summary_by_month(2024)
    print("Monthly:", monthly)
