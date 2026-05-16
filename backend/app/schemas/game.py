from pydantic import BaseModel

class GameResponse(BaseModel):
    id: int
    title: str
    slug: str
    is_active: bool
    applications_count: int = 0

    class Config:
        from_attributes = True
