import { useState } from 'react'

const LEVEL_COLORS = {
  A2: 'bg-green-100 text-green-700',
  B1: 'bg-blue-100  text-blue-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-red-100   text-red-700',
}

/**
 * Componente de flashcard con animación de giro 3D.
 *
 * Props:
 *   word   — objeto con { term, definition, example, level, category }
 *   onEasy — callback cuando el usuario marca la palabra como fácil
 *   onHard — callback cuando la marca como difícil
 *
 * El padre debe pasar key={word.id} para que React reinicie el estado
 * (isFlipped) automáticamente al cambiar de tarjeta.
 */
export default function Flashcard({ word, onEasy, onHard }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div>
      {/* perspective crea el espacio 3D para el hijo */}
      <div
        className="cursor-pointer select-none"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(f => !f)}
      >
        {/* Este div es el "libro" que gira. transform-style preserve-3d
            hace que las dos caras vivan en el mismo espacio 3D */}
        <div
          className="relative h-60 transition-transform duration-500 rounded-2xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ── Cara frontal: solo el término ───────────────────────── */}
          <div
            className="absolute inset-0 bg-white border-2 border-gray-200 rounded-2xl
                        flex flex-col items-center justify-center p-6 gap-4"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex gap-2">
              {word.level && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[word.level] ?? 'bg-gray-100 text-gray-600'}`}>
                  {word.level}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {word.category}
              </span>
            </div>

            <p className="text-3xl font-bold text-gray-900 text-center">{word.term}</p>
            <p className="text-xs text-gray-400">toca para ver la definición</p>
          </div>

          {/* ── Cara trasera: definición + ejemplo ──────────────────── */}
          {/* rotateY(180deg) en el estilo la pone "boca abajo" de base,
              así cuando el contenedor gira 180° esta cara queda derecha */}
          <div
            className="absolute inset-0 bg-indigo-50 border-2 border-indigo-200 rounded-2xl
                        flex flex-col justify-center p-6 gap-3"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
              Definición
            </p>
            <p className="text-gray-800 leading-relaxed">{word.definition}</p>

            {word.example && (
              <>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mt-1">
                  Ejemplo
                </p>
                <p className="text-sm text-gray-600 italic">"{word.example}"</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botones easy/hard — aparecen solo cuando la tarjeta está volteada */}
      {isFlipped && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={onHard}
            className="flex-1 py-3 bg-red-50 text-red-600 font-medium rounded-xl
                       hover:bg-red-100 transition-colors"
          >
            Difícil — mañana
          </button>
          <button
            onClick={onEasy}
            className="flex-1 py-3 bg-green-50 text-green-600 font-medium rounded-xl
                       hover:bg-green-100 transition-colors"
          >
            Fácil — lo sé
          </button>
        </div>
      )}
    </div>
  )
}
