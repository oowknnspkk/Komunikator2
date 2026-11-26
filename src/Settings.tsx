import React, { useEffect, useState } from 'react'

// funkcja zmianty motywu aplikacji
const [theme, setTheme] = useState(
  localStorage.getItem('theme') ?? 'light'
)
useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
}, [theme])
function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
}
export default function Settings() {
    return (
        <div>
            <h1>Ustawienia konta</h1>
            <p>Tutaj będą ustawienia użytkownika.</p>
            <button onClick={toggleTheme}>
                {theme === 'light' ? 'Ciemny motyw' : 'Jasny motyw'}
            </button>
            <button onClick={() => { }}>Zapisz ustawienia</button>
            <button onClick={() => { }}>Wroc </button>
        </div>
    )
}