/**
 * Tarjeta de artículo de noticias.
 *
 * Props:
 *   article        — { title, description, url, image, source, published_at }
 *   onAnalyze      — callback al pulsar "Analyze vocabulary"
 *   isAnalyzing    — true cuando este artículo está siendo procesado por Claude
 *   analyzeDisabled — true cuando se alcanzó el límite de 3 análisis por sesión
 */
export default function NewsCard({ article, onAnalyze, isAnalyzing, analyzeDisabled }) {
  const preview = article.description
    ? article.description.slice(0, 150) + (article.description.length > 150 ? '…' : '')
    : 'No description available.'

  const buttonDisabled = isAnalyzing || analyzeDisabled

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden
                        hover:shadow-md transition-shadow flex flex-col">
      {/* Imagen del artículo — solo si existe */}
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-40 object-cover"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )}

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Fuente y fecha */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-medium text-gray-500">{article.source}</span>
          {article.published_at && (
            <>
              <span>·</span>
              <span>{new Date(article.published_at).toLocaleDateString('en-GB')}</span>
            </>
          )}
        </div>

        {/* Título — enlace externo si no es mock */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {article.url !== '#' ? (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
               className="hover:text-indigo-600 transition-colors">
              {article.title}
            </a>
          ) : article.title}
        </h3>

        {/* Extracto de descripción */}
        <p className="text-xs text-gray-500 leading-relaxed flex-1">{preview}</p>

        {/* Botón de análisis */}
        <button
          onClick={onAnalyze}
          disabled={buttonDisabled}
          className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors
            ${buttonDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-indigo-400
                               border-t-transparent rounded-full animate-spin" />
              Analyzing…
            </span>
          ) : analyzeDisabled ? (
            'Analyze limit reached (3/session)'
          ) : (
            'Analyze vocabulary'
          )}
        </button>
      </div>
    </article>
  )
}
