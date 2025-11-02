import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
}

export const LoginDialog = ({ open, onClose }: LoginDialogProps) => {
  const { login, error } = useAuth()
  const [email, setEmail] = useState('qa.lead@example.com')
  const [password, setPassword] = useState('qa-team')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setLocalError(null)
    try {
      await login(email, password)
      onClose()
    } catch (err: any) {
      setLocalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="glass-panel w-full max-w-md p-8 shadow-2xl">
                <Dialog.Title className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Welcome back
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Use the demo credentials to explore how the evaluation workflow feels for QA leads.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900/80"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                    <input
                      type="password"
                      className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900/80"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>

                  <div className="rounded-2xl bg-primary-500/10 p-4 text-sm text-primary-800 dark:text-primary-200">
                    Hint: demo account is <span className="font-semibold">qa.lead@example.com</span> /{' '}
                    <span className="font-semibold">qa-team</span>
                  </div>

                  {(error || localError) && (
                    <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-500">{localError ?? error}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="min-w-[120px]">
                      {submitting ? 'Signing in?' : 'Sign in'}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
