import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './components/layout/RootLayout'
import { SimulationFormPage } from './pages/SimulationFormPage'
import { SimulationResultsPage } from './pages/SimulationResultsPage'
import { HistoricoSimulationPage } from './pages/HistoricoSimulationPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <SimulationFormPage />,
      },
      {
        path: '/resultado/:id',
        element: <SimulationResultsPage />,
      },
      {
        path: '/historico',
        element: <HistoricoSimulationPage />,
      },

      {
        path: 'resultados/:id',
        element: <SimulationResultsPage />,
      },
    ],
  },
])