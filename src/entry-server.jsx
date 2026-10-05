import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// Apenas a página institucional é pré-renderizada. Nenhuma API privada é consultada.
export function render(pathname = '/') {
  return renderToString(<App pathname={pathname} />)
}
