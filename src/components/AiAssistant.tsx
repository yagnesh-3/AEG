// Mock AI enquiry chat widget. Uses the scripted assistant in ai/mockAssistant.
// Clicking a suggested project navigates to its detail page.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { answerEnquiry } from '../ai/mockAssistant'

type ChatTurn = { role: 'user' | 'ai'; text: string; projectIds: string[] }

export default function AiAssistant() {
  const { projects } = useData()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: 'ai', text: 'Hi, I’m the AEG assistant. Ask me about our projects, projected returns, timelines, or how to invest.', projectIds: [] },
  ])

  const send = (question: string) => {
    const q = question.trim()
    if (!q) return
    const reply = answerEnquiry(q, projects)
    setTurns((prev) => [
      ...prev,
      { role: 'user', text: q, projectIds: [] },
      { role: 'ai', text: reply.text, projectIds: reply.projectIds },
    ])
    setInput('')
  }

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-head">
        <span className="ai-badge">AI</span>
        <div>
          <strong>Investor Enquiry Assistant</strong>
          <small>Prototype — scripted responses over live project data</small>
        </div>
      </div>

      <div className="ai-chat-log">
        {turns.map((turn, index) => (
          <div key={index} className={`ai-bubble ${turn.role}`}>
            <p>{turn.text}</p>
            {turn.projectIds.length > 0 && (
              <div className="ai-suggestions">
                {turn.projectIds.map((id) => {
                  const project = projects.find((p) => p.id === id)
                  if (!project) return null
                  return (
                    <button key={id} type="button" onClick={() => navigate(`/projects/${id}`)}>
                      {project.name} →
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        className="ai-input-row"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. What has the highest projected return?"
          aria-label="Ask the AEG assistant"
        />
        <button type="submit" className="button button-solid">Ask</button>
      </form>

      <div className="ai-quick-prompts">
        {['Show residential opportunities', 'Highest returns?', 'How do I invest?', 'Tell me about Dubai'].map((prompt) => (
          <button key={prompt} type="button" onClick={() => send(prompt)}>{prompt}</button>
        ))}
      </div>
    </div>
  )
}
