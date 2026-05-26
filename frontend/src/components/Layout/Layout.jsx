import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/vocabulary', label: 'Vocabulario' },
  { to: '/news',       label: 'Noticias' },
  { to: '/grammar',    label: 'Gramática' },
  { to: '/music',      label: 'Música' },
  { to: '/practice',   label: 'Práctica' },
  { to: '/progress',   label: 'Progreso' },
]

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
          <span className="font-bold text-indigo-600 shrink-0">EnglishApp</span>

          {/* Nav — scroll horizontal en móvil */}
          <nav className="flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
