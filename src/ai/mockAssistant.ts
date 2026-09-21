// Prototype-grade mock AI. No external API — scripted keyword/intent matching
// over the project data plus a simple client-side project matcher.

import type { Project, ProjectCategory } from '../types'

export type AssistantReply = {
  text: string
  projectIds: string[]
}

// Very small intent matcher for the investor enquiry assistant.
export function answerEnquiry(question: string, projects: Project[]): AssistantReply {
  const q = question.toLowerCase()

  const mentioned = projects.filter((p) =>
    q.includes(p.name.toLowerCase()) || q.includes(p.location.split(',')[0].toLowerCase()),
  )

  if (/(hello|hi|hey)\b/.test(q)) {
    return { text: 'Hi, I’m the AEG assistant. Ask me about our projects, returns, timelines, or how to invest and I’ll point you in the right direction.', projectIds: [] }
  }

  if (mentioned.length) {
    const p = mentioned[0]
    const done = p.milestones.filter((m) => m.status === 'complete').length
    return {
      text: `${p.name} is a ${p.category.toLowerCase()} project in ${p.location}, currently "${p.status}". It has a projected return of ${p.returnRate} on a ${p.budget} project value, with ${done} of 7 key milestones complete. Its current focus is: ${p.headlineMilestone}.`,
      projectIds: [p.id],
    }
  }

  if (/(return|yield|roi|irr|profit)/.test(q)) {
    const ranked = [...projects].sort((a, b) => parseFloat(b.returnRate) - parseFloat(a.returnRate)).slice(0, 3)
    return {
      text: `Our highest projected returns right now are ${ranked.map((p) => `${p.name} (${p.returnRate})`).join(', ')}. Returns vary by project stage and category — I can share the feasibility summary for any of these.`,
      projectIds: ranked.map((p) => p.id),
    }
  }

  if (/(residential|land|house|home)/.test(q)) {
    return categoryReply('Residential Land', projects)
  }
  if (/(commercial|office|retail|industrial|logistic|warehouse)/.test(q)) {
    return categoryReply('Commercial Land', projects)
  }
  if (/(farm|rural|agricult|vineyard|orchard|grazing)/.test(q)) {
    return categoryReply('Farming Land', projects)
  }
  if (/(dubai|uae)/.test(q)) {
    return categoryReply('Dubai Property', projects)
  }
  if (/(india|bengaluru|bangalore|hyderabad|pune|chennai)/.test(q)) {
    return categoryReply('Property – India', projects)
  }

  if (/(invest|buy|unit|how do i|get started|join)/.test(q)) {
    return { text: 'To invest with AEG, register your interest through the contact form and our team will share the relevant feasibility report and unit trust details. Investors get a portal login to track project milestones, documents and distributions.', projectIds: [] }
  }

  if (/(timeline|milestone|when|complete|stage|progress)/.test(q)) {
    return { text: 'Every AEG project is tracked against seven milestones, from Land Settlement (M1) through to Lots Sold & Settled (M7). Tell me a project name and I’ll share exactly where it sits.', projectIds: [] }
  }

  if (/(risk|safe|secure)/.test(q)) {
    return { text: 'Each project carries a risk register across four categories — Approvals & Regulatory, Technical & Design, Financial & Market, and Programme & Delivery — with mitigation notes that feed into investor updates. Ask me about a specific project to see its profile.', projectIds: [] }
  }

  // Fallback: suggest a few active opportunities.
  const active = projects.filter((p) => p.status !== 'Completed').slice(0, 3)
  return {
    text: 'I can help with project details, projected returns, timelines and how to invest. For example, you might explore ' + active.map((p) => p.name).join(', ') + '. What are you most interested in?',
    projectIds: active.map((p) => p.id),
  }
}

function categoryReply(category: ProjectCategory, projects: Project[]): AssistantReply {
  const matches = projects.filter((p) => p.category === category && p.status !== 'Completed').slice(0, 3)
  if (!matches.length) {
    return { text: `We don't have an active ${category.toLowerCase()} opportunity open right now, but new projects are added regularly.`, projectIds: [] }
  }
  return {
    text: `In ${category}, current opportunities include ${matches.map((p) => `${p.name} in ${p.location} (${p.returnRate} projected)`).join(', ')}.`,
    projectIds: matches.map((p) => p.id),
  }
}

// ---- Project matcher -------------------------------------------------------

export type MatchInput = {
  category: string
  budget: number
  goal: 'growth' | 'income' | 'balanced'
}

export type MatchResult = {
  project: Project
  score: number
  reason: string
}

function budgetValue(budget: string): number {
  const n = parseFloat(budget.replace(/[^\d.]/g, ''))
  return budget.toLowerCase().includes('m') ? n * 1_000_000 : n
}

export function matchProjects(input: MatchInput, projects: Project[]): MatchResult[] {
  return projects
    .filter((p) => p.status !== 'Completed')
    .map((p) => {
      let score = 0
      const reasons: string[] = []

      if (input.category === 'Any' || p.category === input.category) {
        score += 40
        if (input.category !== 'Any') reasons.push(`matches your ${p.category} preference`)
      }

      const value = budgetValue(p.budget)
      if (value <= input.budget * 1_000_000) {
        score += 30
        reasons.push('within your budget range')
      }

      const rate = parseFloat(p.returnRate)
      if (input.goal === 'growth' && rate >= 18) {
        score += 30
        reasons.push(`strong ${p.returnRate} growth profile`)
      } else if (input.goal === 'income' && p.category === 'Farming Land') {
        score += 25
        reasons.push('steady rural income profile')
      } else if (input.goal === 'balanced' && rate >= 15 && rate < 20) {
        score += 25
        reasons.push('balanced risk/return profile')
      } else {
        score += 10
      }

      return {
        project: p,
        score,
        reason: reasons.length ? reasons.join(', ') : 'general portfolio fit',
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}
