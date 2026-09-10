import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { CATEGORY_LABELS } from '@/lib/labels';
import { currencyCompact } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Project } from '@/types';

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  projects?: Project[];
}

const SUGGESTIONS = [
  'Show me residential land projects',
  'What farming land do you hold?',
  'Which projects are completed?',
  'What is the minimum investment?',
];

/**
 * Rule-based enquiry assistant for the public site. It matches keywords against
 * the live project list and hands off to the enquiry form — there is no model
 * call behind it, and the widget says so.
 */
export function AiAssistant() {
  const { projects } = useData();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'bot',
      text: 'Welcome to Alliance Estate Group. I can help you find projects by category, location, status or budget. What are you looking for?',
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  const respond = useMemo(
    () =>
      (query: string): Message => {
        const q = query.toLowerCase();
        const id = Date.now();

        const budgetMatch = q.match(/(\d+(?:\.\d+)?)\s*(m|million|k)/);
        const budgetCap = budgetMatch
          ? parseFloat(budgetMatch[1]!) * (budgetMatch[2]!.startsWith('k') ? 1_000 : 1_000_000)
          : null;

        let matched = projects;
        let criteria: string[] = [];

        const categoryHits = (Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).filter(
          (key) => {
            const words = CATEGORY_LABELS[key].toLowerCase().split(/[^a-z]+/).filter(Boolean);
            return words.some((w) => w.length > 3 && q.includes(w));
          },
        );
        if (categoryHits.length > 0) {
          matched = matched.filter((p) => categoryHits.includes(p.category));
          criteria.push(categoryHits.map((c) => CATEGORY_LABELS[c]).join(' or '));
        }

        if (/complete|delivered|finished|track record/.test(q)) {
          matched = matched.filter((p) => p.status === 'completed');
          criteria.push('completed');
        } else if (/new|upcoming|open|available/.test(q)) {
          matched = matched.filter((p) => p.status === 'new');
          criteria.push('newly secured');
        }

        const places = ['sydney', 'adelaide', 'dubai', 'india', 'nsw', 'hyderabad', 'bengaluru', 'riverina'];
        const place = places.find((p) => q.includes(p));
        if (place) {
          matched = matched.filter((p) =>
            `${p.location} ${p.state} ${p.country}`.toLowerCase().includes(place),
          );
          criteria.push(place[0]!.toUpperCase() + place.slice(1));
        }

        if (budgetCap) {
          matched = matched.filter((p) => p.financials.investorCapitalTarget <= budgetCap);
          criteria.push(`raise under ${currencyCompact(budgetCap)}`);
        }

        if (/minimum|how much|invest amount|ticket size/.test(q)) {
          return {
            id,
            from: 'bot',
            text: 'Investments are made through an AEG unit trust, with units issued at $1,000 each and a typical minimum parcel of 250 units. A relationship manager can walk you through the current raises — send an enquiry and we will be in touch within one business day.',
          };
        }

        if (/feasibility|report|return|irr/.test(q)) {
          return {
            id,
            from: 'bot',
            text: 'Every AEG project carries a feasibility report covering costs, forecast returns, delivery timeline and risk. Target IRRs across the current portfolio range from roughly 14% on rural holdings to 24% on residential subdivisions. Feasibility summaries are shared with investors before any capital is committed.',
          };
        }

        if (matched.length === 0) {
          return {
            id,
            from: 'bot',
            text: 'I could not find a project matching that. We hold residential, commercial and farming land across NSW and South Australia, plus holdings in Dubai and India. Try naming a category or a location, or send us an enquiry and a person will follow up.',
          };
        }

        const shown = matched.slice(0, 3);
        const suffix = matched.length > shown.length ? ` (${matched.length} in total)` : '';
        const lead = criteria.length > 0 ? `Here is what we hold in ${criteria.join(', ')}` : 'Here are a few from the portfolio';

        return { id, from: 'bot', text: `${lead}${suffix}:`, projects: shown };
      },
    [projects],
  );

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: Date.now() - 1, from: 'user', text: trimmed }]);
    setInput('');
    window.setTimeout(() => setMessages((prev) => [...prev, respond(trimmed)]), 380);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'no-print fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gold px-4 py-3 text-sm font-medium text-white shadow-panel transition-transform hover:bg-gold-deep',
          open && 'scale-95',
        )}
        aria-label={open ? 'Close assistant' : 'Open the AEG assistant'}
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask AEG'}</span>
      </button>

      {open ? (
        <div className="no-print fixed bottom-20 right-4 z-50 flex max-h-[70vh] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
          <div className="flex items-center gap-2.5 border-b border-line bg-navy px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-gold">
              <MessageSquare size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-white">AEG Assistant</p>
              <p className="text-[11.5px] text-white/55">Project matching &amp; enquiries</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                    msg.from === 'user'
                      ? 'rounded-br-sm bg-navy text-white'
                      : 'rounded-bl-sm bg-ivory text-navy',
                  )}
                >
                  <p>{msg.text}</p>
                  {msg.projects ? (
                    <ul className="mt-2.5 space-y-1.5">
                      {msg.projects.map((p) => (
                        <li key={p.id}>
                          <Link
                            to={`/projects/${p.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg border border-line bg-surface px-2.5 py-2 transition-colors hover:border-gold"
                          >
                            <span className="block text-[12.5px] font-medium text-navy">{p.name}</span>
                            <span className="block text-[11.5px] text-slate">
                              {CATEGORY_LABELS[p.category]} · {p.location}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {messages.length <= 2 ? (
            <div className="scroll-x border-t border-line px-3 py-2">
              <div className="flex min-w-max gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-slate transition-colors hover:border-gold hover:text-navy"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line px-3 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a project…"
              aria-label="Ask the AEG assistant"
              className="flex-1 bg-transparent px-1 text-[13px] text-navy placeholder:text-slate-light focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-navy p-2 text-white transition-colors hover:bg-navy-soft disabled:opacity-40"
              disabled={!input.trim()}
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>

          <p className="border-t border-line-soft bg-ivory px-4 py-1.5 text-center text-[10.5px] text-slate-light">
            Automated assistant · a person will follow up on any enquiry
          </p>
        </div>
      ) : null}
    </>
  );
}
