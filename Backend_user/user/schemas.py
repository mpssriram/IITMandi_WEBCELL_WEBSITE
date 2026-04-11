from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: Optional[EmailStr] = None
    roll_number: Optional[str] = Field(default=None, min_length=4, max_length=30)
    password: str = Field(..., min_length=8, max_length=64)

    @model_validator(mode="after")
    def validate_identifier(self):
        if not self.email and not self.roll_number:
            raise ValueError("Provide at least an email or IIT roll number.")
        return self


class UserLoginRequest(BaseModel):
    identifier: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    email: Optional[EmailStr] = None
    roll_number: Optional[str] = Field(default=None, min_length=4, max_length=30)

    @model_validator(mode="after")
    def validate_fields(self):
        if self.name is None and self.email is None and self.roll_number is None:
            raise ValueError("Provide at least one field to update.")
        return self


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: Optional[str]
    roll_number: Optional[str]
    role: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
