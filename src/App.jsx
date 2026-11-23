import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import { Loader, ErrorBoundary } from './components/ui.jsx'

const Explore = lazy(() => import('./pages/Explore.jsx'))
const GamePage = lazy(() => import('./pages/GamePage.jsx'))
const Collection = lazy(() => import('./pages/Collection.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="games/:slug" element={<GamePage />} />
            <Route path="favorites" element={<Collection kind="favorites" />} />
            <Route path="recent" element={<Collection kind="recent" />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
