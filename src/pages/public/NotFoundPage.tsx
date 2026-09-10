import { ButtonLink } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="container-aeg flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-[32px] md:text-[40px]">We couldn’t find that page</h1>
      <p className="mt-4 max-w-md text-[15px] text-slate">
        The page you are looking for may have moved, or the project may no longer be listed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Back to home</ButtonLink>
        <ButtonLink to="/projects" variant="secondary">
          Browse projects
        </ButtonLink>
      </div>
    </div>
  );
}
