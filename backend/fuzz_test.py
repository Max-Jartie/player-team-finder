import pytest
from hypothesis import given, strategies as st
from fastapi.testclient import TestClient

from app.main import app 

client = TestClient(app)

fuzz_jsonb_strategy = st.dictionaries(
    keys=st.text(min_size=1, max_size=50),
    values=st.one_of(st.text(), st.integers(), st.booleans(), st.none())
)

@pytest.mark.parametrize("game_slug", ["cs2", "dota2", "valorant", "minecraft", "random_fuzz_game"])
@given(
    description=st.text(max_size=2000),
    game_data=fuzz_jsonb_strategy
)
def test_create_application_fuzz(game_slug, description, game_data):
    """
    Фаззинг-тест: отправляет сотни случайных комбинаций данных в API.
    Цель — убедиться, что бэкенд возвращает 201 или понятную ошибку (400, 422, 401),
    но НИКОГДА не падает с ошибкой 500 (Internal Server Error).
    """
    
    payload = {
      "game_slug": game_slug,
      "description": description,
      "game_specific_data": game_data
    }
    
    response = client.post("/api/v1/applications/", json=payload)
    
    assert response.status_code != 500
