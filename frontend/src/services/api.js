import axios from 'axios'

// La URL base viene de frontend/.env.local → VITE_API_BASE_URL
// Vite reemplaza import.meta.env.* en tiempo de build
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

export const vocabularyApi = {
  // filters: { category?: string, level?: string }
  getAll:  (filters = {}) => api.get('/api/vocabulary', { params: filters }),
  create:  (data)         => api.post('/api/vocabulary', data),
  update:  (id, data)     => api.put(`/api/vocabulary/${id}`, data),
  remove:  (id)           => api.delete(`/api/vocabulary/${id}`),
  // difficulty: 'easy' | 'hard'
  review:  (id, difficulty) => api.post(`/api/vocabulary/${id}/review`, { difficulty }),
  getDue:  ()             => api.get('/api/vocabulary/due'),
}

export const newsApi = {
  // category: 'technology' | 'science' | 'environment' | 'sports' | 'general'
  getArticles: (category = 'technology') =>
    api.get('/api/news', { params: { category } }),
  // text: título + descripción del artículo
  analyze: (text) =>
    api.post('/api/news/analyze', { text }),
}
