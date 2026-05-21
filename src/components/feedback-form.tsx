'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Mail,
  MessageSquare,
  Check,
  Loader2,
  Lightbulb,
  Bug,
  Sparkles,
  Heart,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Formspree endpoint from environment variable (with fallback for development)
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xaqllokg'

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Feature idea', text: 'I wish I could...' },
  { icon: Bug, label: 'Bug report', text: 'I found an issue where...' },
  { icon: Sparkles, label: 'Improvement', text: 'It would be better if...' },
  { icon: Heart, label: 'Love it', text: 'My favorite thing is...' },
]

interface FormState {
  submitting: boolean
  success: boolean
  error: string | null
}

export function FeedbackForm() {
  const [formState, setFormState] = useState<FormState>({
    submitting: false,
    success: false,
    error: null,
  })

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null)

  const handlePromptClick = useCallback((index: number) => {
    setSelectedPrompt(index)
    setMessage(QUICK_PROMPTS[index].text)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !message) {
      toast.error('Please fill in all fields')
      return
    }

    setFormState({ submitting: true, success: false, error: null })

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
          category: selectedPrompt !== null ? QUICK_PROMPTS[selectedPrompt].label : 'General',
        }),
      })

      if (response.ok) {
        setFormState({ submitting: false, success: true, error: null })
        setEmail('')
        setMessage('')
        setSelectedPrompt(null)
        toast.success('Thank you for your feedback!')
      } else {
        const data = await response.json()
        setFormState({
          submitting: false,
          success: false,
          error: data.error || 'Something went wrong',
        })
        toast.error(data.error || 'Failed to submit feedback')
      }
    } catch (error) {
      setFormState({
        submitting: false,
        success: false,
        error: 'Network error. Please try again.',
      })
      toast.error('Failed to submit feedback. Please try again.')
    }
  }, [email, message, selectedPrompt])

  if (formState.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-emerald-500/20">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-emerald-400 mb-1">
          Thank You!
        </h3>
        <p className="text-sm text-white/50">
          Your feedback shapes what we build next.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormState({ submitting: false, success: false, error: null })}
          className="mt-4 border-white/10 text-white/60 hover:text-white hover:border-white/20"
        >
          Send Another
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick prompt chips */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-white/40">
          What&apos;s on your mind?
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => handlePromptClick(i)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                selectedPrompt === i
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white/60'
              }`}
            >
              <prompt.icon className="h-3 w-3" />
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs uppercase tracking-wider text-white/40">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-xs uppercase tracking-wider text-white/40">
          Your feedback
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-white/20" />
          <Textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              if (selectedPrompt !== null && e.target.value !== QUICK_PROMPTS[selectedPrompt].text) {
                setSelectedPrompt(null)
              }
            }}
            placeholder="Tell us what you think, suggest features, or report issues..."
            required
            rows={4}
            className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-orange-500/20 resize-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={formState.submitting}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 gap-2 shadow-lg shadow-orange-500/20"
      >
        {formState.submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Feedback
          </>
        )}
      </Button>

      <AnimatePresence>
        {formState.error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 text-center"
          >
            {formState.error}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-center text-[10px] text-white/20">
        No account needed &middot; Usually responds within 24h
      </p>
    </form>
  )
}
