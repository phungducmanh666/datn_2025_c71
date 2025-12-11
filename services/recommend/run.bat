@echo off
call .\.venv311\Scripts\activate.bat
py -3.11 -m uvicorn main:app --reload --port 11000
pause