import { useState, useEffect } from 'react'
import { vocabularyApi } from '../services/api'
import Flashcard from '../components/Flashcard/Flashcard'

const CATEGORIES = ['General', 'Environment', 'Technology', 'Sports', 'Glocal Prep']
const LEVELS     = ['A2', 'B1', 'B2', 'C1']

const LEVEL_COLORS = {
  A2: 'bg-green-100 text-green-700',
  B1: 'bg-blue-100  text-blue-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-red-100   text-red-700',
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal de Vocabulario
// ─────────────────────────────────────────────────────────────────────────────
export default function Vocabulary() {
  const [words,    setWords]    = useState([])
  const [dueCount, setDueCount] = useState(0)
  const [loading,  setLoading]  = useState(true)

  // Vista activa: 'list' o 'flashcard'
  const [view, setView] = useState('list')

  // Lista de palabras que se mostrarán en la sesión de flashcards
  const [sessionWords, setSessionWords] = useState([])
  const [cardIndex,    setCardIndex]    = useState(0)

  // Filtros del listado
  const [filters,   setFilters]   = useState({ category: '', level: '' })
  const [showForm,  setShowForm]  = useState(false)
  const [formData,  setFormData]  = useState({
    term: '', definition: '', example: '', category: 'General', level: 'B1',
  })

  // Carga palabras cada vez que cambian los filtros
  useEffect(() => {
    loadWords()
  }, [filters])

  // Carga el contador de pendientes al montar
  useEffect(() => {
    loadDueCount()
  }, [])

  async function loadWords() {
    setLoading(true)
    try {
      const res = await vocabularyApi.getAll(filters)
      setWords(res.data)
    } catch (err) {
      console.error('Error cargando vocabulario:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadDueCount() {
    try {
      const res = await vocabularyApi.getDue()
      setDueCount(res.data.length)
    } catch (err) {
      console.error('Error cargando pendientes:', err)
    }
  }

  // Inicia una sesión de flashcards con la lista que se le pase
  function startSession(wordsToReview) {
    if (wordsToReview.length === 0) return
    setSessionWords(wordsToReview)
    setCardIndex(0)
    setView('flashcard')
  }

  // Marca una palabra como repasada y avanza a la siguiente tarjeta
  async function handleReview(wordId, difficulty) {
    try {
      await vocabularyApi.review(wordId, difficulty)

      if (cardIndex < sessionWords.length - 1) {
        setCardIndex(i => i + 1)
      } else {
        // Sesión terminada — volver al listado y refrescar datos
        setView('list')
        loadWords()
        loadDueCount()
      }
    } catch (err) {
      console.error('Error al repasar palabra:', err)
    }
  }

  async function handleAddWord(e) {
    e.preventDefault()
    try {
      const res = await vocabularyApi.create(formData)
      // Añade la nueva palabra al inicio del listado sin recargar todo
      setWords(prev => [res.data, ...prev])
      setDueCount(n => n + 1) // nueva palabra = pendiente de repaso
      setShowForm(false)
      setFormData({ term: '', definition: '', example: '', category: 'General', level: 'B1' })
    } catch (err) {
      console.error('Error creando palabra:', err)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta palabra?')) return
    try {
      await vocabularyApi.remove(id)
      setWords(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Error eliminando palabra:', err)
    }
  }

  // ── Vista flashcard ────────────────────────────────────────────────────────
  if (view === 'flashcard') {
    const current = sessionWords[cardIndex]

    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setView('list')}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Volver a la lista
          </button>
          <span className="text-sm text-gray-400">
            {cardIndex + 1} / {sessionWords.length}
          </span>
        </div>

        {/* key={current.id} hace que React reinicie el estado interno del
            Flashcard (isFlipped) cada vez que cambia la tarjeta */}
        <Flashcard
          key={current.id}
          word={current}
          onEasy={() => handleReview(current.id, 'easy')}
          onHard={() => handleReview(current.id, 'hard')}
        />

        {/* Navegación libre entre tarjetas (sin contar como repaso) */}
        <div className="flex justify-between mt-6">
          <button
            disabled={cardIndex === 0}
            onClick={() => setCardIndex(i => i - 1)}
            className="text-sm text-gray-400 disabled:opacity-30 hover:text-gray-600"
          >
            ← Anterior
          </button>
          <button
            disabled={cardIndex === sessionWords.length - 1}
            onClick={() => setCardIndex(i => i + 1)}
            className="text-sm text-gray-400 disabled:opacity-30 hover:text-gray-600"
          >
            Siguiente →
          </button>
        </div>
      </div>
    )
  }

  // ── Vista lista ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vocabulario</h1>
        <div className="flex gap-2">
          <button
            onClick={() => startSession(words)}
            disabled={words.length === 0}
            className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg
                       hover:bg-indigo-200 disabled:opacity-40 transition-colors"
          >
            Flashcards
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition-colors"
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Banner de pendientes — solo visible si hay palabras que repasar */}
      {dueCount > 0 && (
        <button
          onClick={async () => {
            const res = await vocabularyApi.getDue()
            startSession(res.data)
          }}
          className="w-full mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl
                     text-amber-700 text-sm text-left hover:bg-amber-100 transition-colors"
        >
          <span className="font-semibold">{dueCount}</span>{' '}
          {dueCount === 1 ? 'palabra pendiente' : 'palabras pendientes'} de repaso hoy —{' '}
          <span className="underline">empezar sesión</span>
        </button>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.level}
          onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600"
        >
          <option value="">Todos los niveles</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Conteo rápido */}
        {!loading && (
          <span className="ml-auto text-sm text-gray-400 self-center">
            {words.length} {words.length === 1 ? 'palabra' : 'palabras'}
          </span>
        )}
      </div>

      {/* Grid de palabras */}
      {loading ? (
        <p className="text-center text-gray-400 py-16">Cargando...</p>
      ) : words.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2">No hay palabras todavía.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-500 hover:underline text-sm"
          >
            Agrega tu primera palabra →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map(word => (
            <WordCard key={word.id} word={word} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal para agregar palabra */}
      {showForm && (
        <WordForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddWord}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta de palabra en el listado
// ─────────────────────────────────────────────────────────────────────────────
function WordCard({ word, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">{word.term}</h3>
        <button
          onClick={() => onDelete(word.id)}
          aria-label="Eliminar"
          className="text-gray-300 hover:text-red-400 transition-colors ml-2 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex gap-1.5 mb-2 flex-wrap">
        {word.level && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[word.level] ?? 'bg-gray-100 text-gray-600'}`}>
            {word.level}
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {word.category}
        </span>
      </div>

      {/* line-clamp-2 limita la definición a 2 líneas para mantener el grid uniforme */}
      <p className="text-sm text-gray-600 line-clamp-2">{word.definition}</p>

      {word.review_count > 0 && (
        <p className="text-xs text-gray-300 mt-2">
          Repasada {word.review_count}× · ef {word.ease_factor.toFixed(1)}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal para agregar nueva palabra
// ─────────────────────────────────────────────────────────────────────────────
function WordForm({ formData, setFormData, onSubmit, onCancel }) {
  const update = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }))

  return (
    // Overlay oscuro — clic fuera del modal cancela
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar palabra</h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Término *"
            value={formData.term}
            onChange={update('term')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <textarea
            required
            placeholder="Definición *"
            rows={3}
            value={formData.definition}
            onChange={update('definition')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            placeholder="Ejemplo de uso (opcional)"
            value={formData.example}
            onChange={update('example')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          <div className="flex gap-3">
            <select
              value={formData.category}
              onChange={update('category')}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={formData.level}
              onChange={update('level')}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm
                         hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
