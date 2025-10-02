from fastapi import Request
from fastapi.templating import Jinja2Templates
from pydantic_settings import BaseSettings

templates = Jinja2Templates(directory="templates")

class Settings(BaseSettings):
    origin: str = "http://localhost:8000"
    class Config:
        env_file = ".env"

settings = Settings()

BASE_URL = settings.origin

# Function to reuse for each path that serves a HTML
def render_template(request: Request, template_name: str, context: dict = {}):
    base_context = {"request": request, "base_url": BASE_URL}
    base_context.update(context)
    return templates.TemplateResponse(template_name, base_context)