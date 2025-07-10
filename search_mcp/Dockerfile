FROM python:3.11-slim

# Install Python dependencies
RUN pip install --no-cache-dir mcp requests

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary folder
COPY . .

# Run the script
CMD ["python", "search.py"]