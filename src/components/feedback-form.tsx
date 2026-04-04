'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, MessageSquare, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaqllokg'

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
        body: JSON.stringify({ email, message }),
      })

      if (response.ok) {
        setFormState({ submitting: false, success: true, error: null })
        setEmail('')
        setMessage('')
        toast.success('Thank you for your feedback!')
      } else {
        const data = await response.json()
        setFormState({ 
          submitting: false, 
          success: false, 
          error: data.error || 'Something went wrong' 
        })
        toast.error(data.error || 'Failed to submit feedback')
      }
    } catch (error) {
      setFormState({ 
        submitting: false, 
        success: false, 
        error: 'Network error. Please try again.' 
      })
      toast.error('Failed to submit feedback. Please try again.')
    }
  }, [email, message])

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
          Your feedback has been submitted successfully.
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
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs uppercase tracking-wider text-white/50">
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
            className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-orange-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-xs uppercase tracking-wider text-white/50">
          Feedback / Suggestions
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-white/20" />
          <Textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think, suggest features, or report issues..."
            required
            rows={4}
            className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-orange-500/20 resize-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={formState.submitting}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 gap-2"
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

      {formState.error && (
        <p className="text-xs text-red-400 text-center">{formState.error}</p>
      )}
    </form>
  )
}
