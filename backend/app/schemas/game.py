from pydantic import BaseModel, ConfigDict

class GameResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    is_active: bool
    applications_count: int = 0
