from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Any
import os
import shutil
import uuid

from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Define allowed extensions and size limits (e.g., 50MB max)
ALLOWED_EXTENSIONS = {
    # Presentations
    ".ppt", ".pptx", ".pdf",
    # Source Code
    ".zip", ".rar", ".tar.gz",
    # Videos
    ".mp4", ".mov", ".webm", ".avi", ".mkv"
}
MAX_FILE_SIZE = 50 * 1024 * 1024 # 50 MB

@router.post("", response_model=dict)
def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Upload a file to the local storage. Returns the secure URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed")

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save the file in chunks to avoid high memory usage
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Check file size after writing to enforce MAX_FILE_SIZE strictly.
        if os.path.getsize(file_path) > MAX_FILE_SIZE:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE / (1024*1024)} MB limit")

        # Validate video duration (Max 5 minutes)
        VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
        if ext in VIDEO_EXTENSIONS:
            import subprocess
            import logging
            try:
                # Run ffprobe to get duration
                result = subprocess.run(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    try:
                        duration = float(result.stdout.strip())
                        if duration > 300: # 5 minutes
                            os.remove(file_path)
                            raise HTTPException(status_code=400, detail="Video duration exceeds the 5-minute limit (300 seconds).")
                    except ValueError:
                        pass # Ignore if output isn't a valid float
            except FileNotFoundError:
                # ffprobe is not installed, fallback validation (size-based is already done)
                logging.warning("ffprobe is not installed on the server. Skipping strict server-side video duration validation. Size limits will still apply as a fallback.")
            except Exception as e:
                logging.error(f"Error validating video duration: {e}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    finally:
        file.file.close()

    # Determine base URL dynamically or from settings
    # Since we don't have request object here to dynamically construct base URL, 
    # we'll use a relative or fixed URL based on common setup. 
    # Using relative URL /uploads/filename allows frontend to append it to its base API URL,
    # or we can construct full absolute URL using localhost:8000 for local testing.
    # Usually in production we'd use settings.DOMAIN or request.base_url.
    # For now, let's return the relative path that can be requested directly.
    return {"url": f"http://localhost:8000/uploads/{unique_filename}"}
