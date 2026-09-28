import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FxProvider } from './fx/Fx'
import { GameProvider } from './game/GameProvider'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <FxProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </FxProvider>
    </MotionConfig>
  </StrictMode>,
)
