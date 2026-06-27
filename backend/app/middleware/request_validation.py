import uuid
from collections.abc import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.constants import (
    ALLOWED_CONTENT_TYPES,
    HTTP_METHODS_WITH_BODY,
    REQUEST_ID_HEADER,
)
from app.core.exceptions import AppException
from app.core.logging import get_logger
from app.schemas.response import error_response

logger = get_logger(__name__)


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validate incoming requests and attach a request ID for tracing."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or str(uuid.uuid4())
        request.state.request_id = request_id

        if request.method in HTTP_METHODS_WITH_BODY:
            content_type = request.headers.get("content-type", "").lower()
            content_length = request.headers.get("content-length")

            if content_length and content_length != "0" and content_type:
                if not any(
                    content_type.startswith(allowed) for allowed in ALLOWED_CONTENT_TYPES
                ):
                    return JSONResponse(
                        status_code=415,
                        content=error_response(
                            message="Unsupported media type",
                            errors=["Content-Type must be application/json"],
                        ),
                        headers={REQUEST_ID_HEADER: request_id},
                    )

        try:
            response = await call_next(request)
        except AppException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content=error_response(message=exc.message, errors=exc.errors),
                headers={REQUEST_ID_HEADER: request_id},
            )

        response.headers[REQUEST_ID_HEADER] = request_id
        logger.debug(
            "%s %s -> %s [%s]",
            request.method,
            request.url.path,
            response.status_code,
            request_id,
        )
        return response
