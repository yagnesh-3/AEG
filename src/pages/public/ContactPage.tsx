import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MapPin, MessageSquare, Star } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Field, Input, Select, Textarea, useToast } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { cn } from '@/lib/cn';
import { date } from '@/lib/format';

export function ContactPage() {
  const { projects, addEnquiry, addFeedback, feedbackEntries } = useData();
  const { notify } = useToast();
  const [params] = useSearchParams();

  const [enquiry, setEnquiry] = useState({
    name: '',
    email: '',
    projectSlug: params.get('project') ?? '',
    message: '',
  });
  const [feedback, setFeedback] = useState({ name: '', email: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitEnquiry = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!enquiry.name.trim()) next.name = 'Please tell us your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(enquiry.email)) next.email = 'Enter a valid email address';
    if (enquiry.message.trim().length < 10) next.message = 'Please add a little more detail';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const project = projects.find((p) => p.slug === enquiry.projectSlug);
    addEnquiry({
      id: `e-${Date.now()}`,
      subject: project ? `Website enquiry — ${project.name}` : 'General website enquiry',
      contactName: enquiry.name,
      contactEmail: enquiry.email,
      projectId: project?.id,
      source: 'website',
      status: 'new',
      raisedOn: new Date().toISOString().slice(0, 10),
      messages: [
        {
          id: `em-${Date.now()}`,
          author: enquiry.name,
          authorRole: 'visitor',
          body: enquiry.message,
          sentOn: new Date().toISOString().slice(0, 10),
        },
      ],
    });

    notify('Thank you — your enquiry has been received. We respond within one business day.');
    setEnquiry({ name: '', email: '', projectSlug: '', message: '' });
  };

  const submitFeedback = (e: FormEvent) => {
    e.preventDefault();
    if (feedback.rating === 0) {
      notify('Please choose a rating before submitting.', 'info');
      return;
    }
    addFeedback({
      id: `fb-${Date.now()}`,
      name: feedback.name.trim() || 'Anonymous',
      email: feedback.email,
      rating: feedback.rating,
      comment: feedback.comment,
      submittedOn: new Date().toISOString().slice(0, 10),
    });
    notify('Thank you for the feedback — it goes straight to the team.');
    setFeedback({ name: '', email: '', rating: 0, comment: '' });
  };

  const recent = feedbackEntries.slice(0, 3);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-12 md:py-16">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2 text-balance text-[34px] md:text-[44px]">Get in touch</h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-slate">
            Ask about a specific project, request an investor introduction, or tell us how we can
            improve. Enquiries reach the relationship management team directly.
          </p>
        </div>
      </section>

      <section>
        <div className="container-aeg grid gap-8 py-12 md:py-16 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Send an enquiry"
                description="We respond within one business day."
              />
              <CardBody>
                <form onSubmit={submitEnquiry} className="space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" required htmlFor="name" error={errors.name}>
                      <Input
                        id="name"
                        value={enquiry.name}
                        onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                        placeholder="Jane Fairbanks"
                      />
                    </Field>
                    <Field label="Email address" required htmlFor="email" error={errors.email}>
                      <Input
                        id="email"
                        type="email"
                        value={enquiry.email}
                        onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>

                  <Field
                    label="Project of interest"
                    htmlFor="project"
                    hint="Optional — leave blank for a general enquiry."
                  >
                    <Select
                      id="project"
                      value={enquiry.projectSlug}
                      onChange={(e) => setEnquiry({ ...enquiry, projectSlug: e.target.value })}
                    >
                      <option value="">General enquiry</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Your message" required htmlFor="message" error={errors.message}>
                    <Textarea
                      id="message"
                      value={enquiry.message}
                      onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                      placeholder="Tell us what you would like to know…"
                      rows={5}
                    />
                  </Field>

                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
                      Send enquiry
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>

            <Card className="mt-6">
              <CardHeader
                title="How are we doing?"
                description="Feedback on the website, the portal or your experience with AEG."
              />
              <CardBody>
                <form onSubmit={submitFeedback} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" htmlFor="fb-name" hint="Optional">
                      <Input
                        id="fb-name"
                        value={feedback.name}
                        onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      />
                    </Field>
                    <Field label="Email" htmlFor="fb-email" hint="Optional">
                      <Input
                        id="fb-email"
                        type="email"
                        value={feedback.email}
                        onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label="Rating" required>
                    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating out of five">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const filled = (hoverRating || feedback.rating) >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={feedback.rating === value}
                            aria-label={`${value} out of 5`}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setFeedback({ ...feedback, rating: value })}
                            className="rounded p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              size={24}
                              className={cn(filled ? 'text-gold' : 'text-line')}
                              fill={filled ? 'currentColor' : 'none'}
                            />
                          </button>
                        );
                      })}
                      {feedback.rating > 0 ? (
                        <span className="ml-2 text-[13px] text-slate">{feedback.rating} of 5</span>
                      ) : null}
                    </div>
                  </Field>

                  <Field label="Comments" htmlFor="fb-comment">
                    <Textarea
                      id="fb-comment"
                      value={feedback.comment}
                      onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                      placeholder="What worked well, and what could be better?"
                      rows={4}
                    />
                  </Field>

                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary">
                      Submit feedback
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Reach us directly" />
              <CardBody className="space-y-4">
                {[
                  { icon: MapPin, label: 'Office', value: 'Norwest, Sydney NSW, Australia' },
                  { icon: Mail, label: 'Email', value: 'invest@allianceestate.com.au' },
                  { icon: MessageSquare, label: 'Investor queries', value: 'Raise through your portal for a tracked response' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold-wash text-gold-deep">
                        <Icon size={15} />
                      </span>
                      <div>
                        <p className="text-[12px] uppercase tracking-wide text-slate">{item.label}</p>
                        <p className="text-[14px] text-navy">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            {recent.length > 0 ? (
              <Card>
                <CardHeader title="Recent feedback" description="What people have told us lately." />
                <CardBody className="space-y-4 divide-y divide-line-soft">
                  {recent.map((entry) => (
                    <div key={entry.id} className="pt-4 first:pt-0">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <Star
                            key={v}
                            size={13}
                            className={v <= entry.rating ? 'text-gold' : 'text-line'}
                            fill={v <= entry.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-slate">“{entry.comment}”</p>
                      <p className="mt-1.5 text-[12px] text-slate-light">
                        {entry.name} · {date(entry.submittedOn)}
                      </p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
