import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Vocabulary from './pages/Vocabulary'
import News from './pages/News'

// Placeholder mientras se implementan las demás secciones
function ComingSoon({ name }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-300">
      <p className="text-lg">{name} — próximamente</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Redirige la raíz a vocabulario */}
          <Route path="/" element={<Navigate to="/vocabulary" replace />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/news"       element={<News />} />
          <Route path="/grammar"    element={<ComingSoon name="Gramática" />} />
          <Route path="/music"      element={<ComingSoon name="Música" />} />
          <Route path="/practice"   element={<ComingSoon name="Práctica" />} />
          <Route path="/progress"   element={<ComingSoon name="Progreso" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
