from app import db
from datetime import datetime


class VocabularyWord(db.Model):
    __tablename__ = 'vocabulary_words'

    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.String(100), nullable=False)
    definition = db.Column(db.Text, nullable=False)
    example = db.Column(db.Text)
    level = db.Column(db.String(10))          # A2, B1, B2, C1
    category = db.Column(db.String(50))       # General, Environment, Technology…
    origin = db.Column(db.String(50))         # news, song, manual
    next_review = db.Column(db.DateTime, default=datetime.utcnow)
    interval_days = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'term': self.term,
            'definition': self.definition,
            'example': self.example,
            'level': self.level,
            'category': self.category,
            'origin': self.origin,
            'next_review': self.next_review.isoformat() if self.next_review else None,
            'interval_days': self.interval_days,
        }
