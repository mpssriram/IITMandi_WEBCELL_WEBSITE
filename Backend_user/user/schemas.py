<<<<<<< Updated upstream
=======
<<<<<<< HEAD
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr | None = None
    roll_number: str | None = Field(default=None, max_length=50)
    password: str = Field(min_length=6, max_length=255)


class UserLoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6, max_length=255)


class UserUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    email: EmailStr | None = None
    roll_number: str | None = Field(default=None, max_length=50)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str | None = None
    roll_number: str | None = None
    role: str
    created_at: object | None = None
    updated_at: object | None = None
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse
    access_token: str
<<<<<<< Updated upstream
    token_type: str = "bearer"
=======
<<<<<<< HEAD
    token_type: str


class EventRegistrationResponse(BaseModel):
    success: bool
    message: str
    event_id: int
    user_id: int


class ProjectPayload(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    github_link: str | None = None
    tech_stack: str | None = None
=======
    token_type: str = "bearer"
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
