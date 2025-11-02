import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { ResultsDashboardPage } from './pages/ResultsDashboardPage'
import { ToolComparisonPage } from './pages/ToolComparisonPage'
import { ReportInsightsPage } from './pages/ReportInsightsPage'
import { useAuth } from './context/AuthContext'

const Protected = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

const PageWrapper = ({ children }: { children: JSX.Element }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
    {children}
  </motion.div>
)

export default function App() {
  const location = useLocation()

  return (
    <MainLayout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <Protected>
                <PageWrapper>
                  <QuestionnairePage />
                </PageWrapper>
              </Protected>
            }
          />
          <Route
            path="/results"
            element={
              <Protected>
                <PageWrapper>
                  <ResultsDashboardPage />
                </PageWrapper>
              </Protected>
            }
          />
          <Route
            path="/comparison"
            element={
              <Protected>
                <PageWrapper>
                  <ToolComparisonPage />
                </PageWrapper>
              </Protected>
            }
          />
          <Route
            path="/report"
            element={
              <Protected>
                <PageWrapper>
                  <ReportInsightsPage />
                </PageWrapper>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  )
}
