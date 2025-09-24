import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyAuthProvider } from './context/PrivyContextProvider.tsx';
import PrivyProviderWrapper from './context/PrivyProviderWrapper.tsx';
import toast, { Toaster } from 'react-hot-toast';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProviderWrapper>
      <PrivyAuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "black",
                border: "1px solid white",
                color: "white",
                borderRadius: "0px",
              },
            }}
          />
        <App />
      </PrivyAuthProvider>
    </PrivyProviderWrapper>
  </StrictMode>,
)
