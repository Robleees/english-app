from datetime import datetime, timedelta
from app import db


class Word(db.Model):
    __tablename__ = 'words'

    id            = db.Column(db.Integer, primary_key=True)
    term          = db.Column(db.String(100), nullable=False)
    definition    = db.Column(db.Text, nullable=False)
    example       = db.Column(db.Text, default='')
    category      = db.Column(db.String(50), default='General')
    level         = db.Column(db.String(10), default='B1')      # A2 B1 B2 C1
    origin        = db.Column(db.String(20), default='manual')  # news song manual

    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    # Cuándo mostrar esta palabra en la cola de repaso
    next_review_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Cuántas veces la ha repasado el usuario
    review_count  = db.Column(db.Integer, default=0)
    # Multiplicador del intervalo — empieza en 2.5, baja cuando el usuario marca "difícil"
    ease_factor   = db.Column(db.Float, default=2.5)

    def review(self, difficulty: str) -> None:
        """Aplica el algoritmo de spaced repetition.

        easy → próxima revisión en (ease_factor × review_count) días.
        hard → mañana, y ease_factor baja 0.1 (mínimo 1.3 para no colapsar).
        """
        self.review_count += 1

        if difficulty == 'easy':
            # El intervalo crece linealmente con cada repaso exitoso.
            # Ej: revisión 1 easy → round(2.5 × 1) = 3 días
            #     revisión 2 easy → round(2.5 × 2) = 5 días
            interval = max(1, round(self.ease_factor * self.review_count))
            self.next_review_at = datetime.utcnow() + timedelta(days=interval)
        else:
            # Si la palabra es difícil, vuelve mañana y el multiplicador baja un poco
            self.next_review_at = datetime.utcnow() + timedelta(days=1)
            self.ease_factor = max(1.3, round(self.ease_factor - 0.1, 2))

    def to_dict(self) -> dict:
        return {
            'id':             self.id,
            'term':           self.term,
            'definition':     self.definition,
            'example':        self.example,
            'category':       self.category,
            'level':          self.level,
            'origin':         self.origin,
            'created_at':     self.created_at.isoformat(),
            'next_review_at': self.next_review_at.isoformat() if self.next_review_at else None,
            'review_count':   self.review_count,
            'ease_factor':    self.ease_factor,
        }
