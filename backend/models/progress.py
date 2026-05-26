from app import db
from datetime import datetime


class DailyActivity(db.Model):
    __tablename__ = 'daily_activity'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, unique=True)
    words_reviewed = db.Column(db.Integer, default=0)
    chat_minutes = db.Column(db.Integer, default=0)
    grammar_topics_done = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            'date': self.date.isoformat(),
            'words_reviewed': self.words_reviewed,
            'chat_minutes': self.chat_minutes,
            'grammar_topics_done': self.grammar_topics_done,
        }
