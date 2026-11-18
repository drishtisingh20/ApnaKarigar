import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..config import settings
from ..models import UploadOut, User
from ..security import artisan_only

router = APIRouter(prefix="/upload", tags=["uploads"])


def _sniff(data: bytes) -> str | None:
    """Identify the image by its bytes rather than trusting the client's content-type."""
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


@router.post("", response_model=UploadOut, status_code=201)
async def upload_image(file: UploadFile = File(...), _: User = Depends(artisan_only)):
    data = await file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"Photo is larger than {settings.max_upload_mb} MB")
    ext = _sniff(data)
    if not ext:
        raise HTTPException(415, "Only JPEG, PNG or WebP photos are allowed")
    folder = Path(settings.upload_dir)
    folder.mkdir(exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    (folder / name).write_bytes(data)
    # Relative on purpose: the app prefixes whatever API address it is using.
    # In production, push to S3/Cloudinary here (container disks are ephemeral).
    return UploadOut(url=f"/uploads/{name}")
