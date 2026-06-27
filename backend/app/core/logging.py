import logging
import sys

from app.core.config import settings
from app.core.constants import LOG_DATE_FORMAT, LOG_FORMAT


def setup_logging() -> None:
    """Configure centralized application logging."""
    log_level = logging.DEBUG if settings.debug else logging.INFO

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    if root_logger.handlers:
        root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(
        logging.Formatter(fmt=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
    )

    root_logger.addHandler(console_handler)

    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.debug else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
