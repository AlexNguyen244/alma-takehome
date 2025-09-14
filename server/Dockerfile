FROM python:3.11-slim

WORKDIR /app

# Copy backend
COPY . .

# Install requiremnets.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Start the app: run Alembic migrations, then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
