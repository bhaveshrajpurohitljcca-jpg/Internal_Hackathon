"""Application-wide constants."""

API_VERSION = "v1"
SERVICE_NAME = "hackathon-portal-api"

HTTP_METHODS_WITH_BODY = frozenset({"POST", "PUT", "PATCH"})
ALLOWED_CONTENT_TYPES = frozenset(
    {
        "application/json",
        "application/json; charset=utf-8",
        "application/x-www-form-urlencoded",
        "multipart/form-data",
    }
)

REQUEST_ID_HEADER = "X-Request-ID"

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
