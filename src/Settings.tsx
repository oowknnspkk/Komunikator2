import { Link } from 'react-router-dom'
import { useTheme } from './ThemeContext'

export default function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <main className="settings-page">
      <section className="settings-card">
        <Link className="back-link" to="/panel">← Wróć do panelu</Link>
        <p className="eyebrow">PREFERENCJE</p>
        <h1>Ustawienia</h1>
        <p className="settings-description">
          Dostosuj wygląd komunikatora do swoich preferencji.
        </p>

        <section className="setting-row" aria-labelledby="theme-heading">
          <div>
            <h2 id="theme-heading">Motyw aplikacji</h2>
            <p>Wybierz jasny lub ciemny wygląd.</p>
          </div>

          <div className="theme-options" role="group" aria-label="Wybór motywu">
            <button
              className={`button ${theme === 'light' ? 'button-selected' : 'button-secondary'}`}
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Jasny
            </button>
            <button
              className={`button ${theme === 'dark' ? 'button-selected' : 'button-secondary'}`}
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Ciemny
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}