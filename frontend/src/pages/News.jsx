import { useState, useEffect } from 'react'
import { newsApi, vocabularyApi } from '../services/api'
import NewsCard from '../components/NewsCard/NewsCard'

const CATEGORIES = [
  { id: 'technology',  label: 'Technology' },
  { id: 'environment', label: 'Environment' },
  { id: 'science',     label: 'Science' },
  { id: 'sports',      label: 'Sports' },
  { id: 'general',     label: 'General' },
]

const LEVEL_COLORS = {
  A2: 'bg-green-100 text-green-700',
  B1: 'bg-blue-100  text-blue-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-red-100   text-red-700',
}

// Máximo de análisis por sesión (protección de cuota de Claude)
const MAX_ANALYSES = 3

// ─────────────────────────────────────────────────────────────────────────────
export default function News() {
  const [articles,    setArticles]    = useState([])
  const [isMock,      setIsMock]      = useState(false)
  const [category,    setCategory]    = useState('technology')
  const [loading,     setLoading]     = useState(true)
  const [analyzingUrl, setAnalyzingUrl] = useState(null) // URL del artículo en proceso
  const [analyzeCount, setAnalyzeCount] = useState(0)   // cuántos análisis se usaron esta sesión
  const [modal,       setModal]       = useState(null)
  // modal = null | { title: string, words: null | [...] }
  // words === null → loading state del modal

  // Carga artículos cada vez que cambia la categoría
  useEffect(() => {
    loadArticles()
  }, [category])

  async function loadArticles() {
    setLoading(true)
    try {
      const res = await newsApi.getArticles(category)
      setArticles(res.data.articles)
      setIsMock(res.data.is_mock)
    } catch (err) {
      console.error('Error cargando noticias:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze(article) {
    if (analyzeCount >= MAX_ANALYSES) return

    // Abre el modal en estado de carga inmediatamente para dar feedback visual
    setModal({ title: article.title, words: null })
    setAnalyzingUrl(article.url)
    setAnalyzeCount(n => n + 1)

    // Combina título y descripción para darle más contexto a Claude
    const text = `${article.title}. ${article.description}`

    try {
      const res = await newsApi.analyze(text)
      // Actualiza el modal con las palabras recibidas
      setModal({ title: article.title, words: res.data })
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al conectar con Claude'
      setModal({ title: article.title, words: [], error: msg })
      console.error('Error analizando artículo:', err)
    } finally {
      setAnalyzingUrl(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Noticias</h1>
        {/* Contador de análisis disponibles */}
        <span className={`text-xs px-3 py-1 rounded-full ${
          analyzeCount >= MAX_ANALYSES
            ? 'bg-red-50 text-red-500'
            : 'bg-indigo-50 text-indigo-600'
        }`}>
          Análisis: {MAX_ANALYSES - analyzeCount}/{MAX_ANALYSES}
        </span>
      </div>

      {/* Banner de datos mock */}
      {isMock && (
        <div className="mb-5 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg
                        text-amber-700 text-xs">
          Mostrando datos de demostración — configura <code className="font-mono">NEWS_API_KEY</code> en{' '}
          <code className="font-mono">backend/.env</code> para ver noticias reales
        </div>
      )}

      {/* Pills de categoría */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              category === c.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid de artículos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No se encontraron artículos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <NewsCard
              key={article.url}
              article={article}
              onAnalyze={() => handleAnalyze(article)}
              isAnalyzing={analyzingUrl === article.url}
              analyzeDisabled={analyzeCount >= MAX_ANALYSES && analyzingUrl !== article.url}
            />
          ))}
        </div>
      )}

      {/* Modal de vocabulario */}
      {modal !== null && (
        <VocabModal
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal que muestra las 5 palabras extraídas por Claude
// ─────────────────────────────────────────────────────────────────────────────
function VocabModal({ modal, onClose }) {
  // Guarda los términos ya guardados para deshabilitar el botón
  const [saved, setSaved] = useState(new Set())
  const [saving, setSaving] = useState(null) // término siendo guardado ahora

  async function handleSave(word) {
    if (saved.has(word.term)) return
    setSaving(word.term)
    try {
      await vocabularyApi.create({
        term:       word.term,
        definition: word.definition,
        example:    word.example,
        level:      word.level,
        category:   'General',
        origin:     'news',
      })
      setSaved(prev => new Set([...prev, word.term]))
    } catch (err) {
      console.error('Error guardando palabra:', err)
    } finally {
      setSaving(null)
    }
  }

  return (
    // Overlay — clic fuera cierra el modal
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Vocabulary from</p>
            <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 pr-6">
              {modal.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 text-xl leading-none ml-2 shrink-0"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 p-5">
          {/* Estado de carga */}
          {modal.words === null && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600
                              rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Claude está analizando el artículo…</p>
            </div>
          )}

          {/* Error */}
          {modal.error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">
              {modal.error}
            </div>
          )}

          {/* Lista de palabras */}
          {modal.words && modal.words.length > 0 && (
            <ul className="flex flex-col gap-3">
              {modal.words.map((word) => {
                const isSaved   = saved.has(word.term)
                const isSaving  = saving === word.term
                return (
                  <li
                    key={word.term}
                    className="border border-gray-100 rounded-xl p-4 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{word.term}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${LEVEL_COLORS[word.level] ?? 'bg-gray-100 text-gray-600'}`}>
                          {word.level}
                        </span>
                      </div>
                      {/* Botón "Save to my vocab" */}
                      <button
                        onClick={() => handleSave(word)}
                        disabled={isSaved || isSaving}
                        className={`text-xs px-3 py-1 rounded-lg shrink-0 transition-colors ${
                          isSaved
                            ? 'bg-green-100 text-green-600 cursor-default'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50'
                        }`}
                      >
                        {isSaving ? '…' : isSaved ? 'Saved' : 'Save to vocab'}
                      </button>
                    </div>

                    <p className="text-sm text-gray-700">{word.definition}</p>
                    <p className="text-xs text-gray-400 italic">"{word.example}"</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
