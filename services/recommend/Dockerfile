FROM python:3.11.14-slim

WORKDIR /app
# requirements.txt lives under the `app/` subfolder in this repo
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the application source (app/) into the image
COPY . .

EXPOSE 8001


CMD ["python", "-u", "app.py"] 
