import React from 'react'
import { createRoot } from 'react-dom/client'
import { getLCP, getFID, getCLS, getFCP, getTTFB } from 'web-vitals'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

const container = document.getElementById('root')

const root = createRoot(container!)

;(async () => {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  )
})()

// getCLS(console.log)
// getFID(console.log)
// getFCP(console.log)
// getLCP(console.log)
// getTTFB(console.log)
