from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Request processed successfully"
    data: T | None = None
    errors: list[str] | dict[str, list[str]] | None = None


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


def success_response(
    data: Any = None,
    message: str = "Request processed successfully",
) -> dict[str, Any]:
    return ApiResponse(success=True, message=message, data=data, errors=None).model_dump()


def error_response(
    message: str,
    errors: list[str] | dict[str, list[str]] | None = None,
    data: Any = None,
) -> dict[str, Any]:
    return ApiResponse(
        success=False,
        message=message,
        data=data,
        errors=errors,
    ).model_dump()
