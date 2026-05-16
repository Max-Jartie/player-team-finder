from app.core.database import SessionLocal
from app.models.application import Game

def seed_games():
    db = SessionLocal()
    
    initial_games = [
        {"title": "Counter-Strike 2", "slug": "cs2"},
        {"title": "Dota 2", "slug": "dota2"},
        {"title": "Valorant", "slug": "valorant"},
        {"title": "Minecraft", "slug": "minecraft"},
    ]
    
    print("Запуск инициализации базы данных играми...")
    
    for game_data in initial_games:
        existing_game = db.query(Game).filter(Game.slug == game_data["slug"]).first()
        
        if not existing_game:
            new_game = Game(title=game_data["title"], slug=game_data["slug"])
            db.add(new_game)
            print(f"➕ Игра {game_data['title']} добавлена.")
        else:
            print(f"ℹ️ Игра {game_data['title']} уже существует в базе.")
            
    db.commit()
    db.close()
    print("Инициализация успешно завершена!")

if __name__ == "__main__":
    seed_games()
