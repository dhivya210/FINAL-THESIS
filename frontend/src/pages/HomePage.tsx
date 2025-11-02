import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

const highlights = [
  {
    title: 'Data-backed scoring',
    description: 'Blend questionnaire inputs with seeded benchmarking stats to surface the strongest 3 automation tools.',
    metric: 'Top tools scored instantly'
  },
  {
    title: 'Live what-if sliders',
    description: 'Reweight criteria in real-time and see radar + bar charts update without leaving the dashboard.',
    metric: '11 weighted dimensions'
  },
  {
    title: 'Executive-ready outputs',
    description: 'Export polished PDFs or JSON bundles to reuse downstream across programme planning.',
    metric: 'PDF & JSON exports'
  }
]

export const HomePage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-16">
      <section className="glass-panel overflow-hidden p-10 md:p-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-200">
              <SparklesIcon className="h-4 w-4" /> QA automation guidance, reimagined
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              Confidently choose the right test automation platform in minutes
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Answer twelve targeted questions and get a ranked shortlist with rich visuals. Adjust priorities on the fly
              and export a board-ready summary for your QA leadership team.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/questionnaire">
                <Button size="lg" className="flex items-center gap-2">
                  {isAuthenticated ? 'Start evaluation' : 'Sign in to start'}
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                to="/results"
                className="text-sm font-semibold text-primary-600 transition hover:text-primary-500 dark:text-primary-200"
              >
                Preview the dashboard
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -translate-y-4 translate-x-6 rounded-3xl bg-gradient-to-br from-primary-500/40 via-purple-500/40 to-sky-500/30 blur-3xl" />
            <Card className="relative space-y-6 bg-white/80 p-8 shadow-2xl dark:bg-slate-900/80">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">What you can expect</h3>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  Weighted scoring anchored on cross-browser support, AI maturity, reporting depth, and maintenance effort.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  Friendly questionnaires with inline guidance curated for QA leads.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  Admin tooling to update seeded benchmarks when vendors evolve.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary-500">{item.metric}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}
