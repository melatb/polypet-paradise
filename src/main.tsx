import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FxProvider } from './fx/Fx'
import { AccountProvider } from './account/AccountProvider'
import { Root } from './Root'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AccountProvider>
        <FxProvider>
          <Root />
        </FxProvider>
      </AccountProvider>
    </MotionConfig>
  </StrictMode>,
)
