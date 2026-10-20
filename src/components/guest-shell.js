export function GuestShell({ title, children, footer }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <header className="border-b border-ink bg-white">
        <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-6 md:max-w-2xl">
          <span className="h-2.5 w-2.5 rounded-full bg-green" aria-hidden="true" />
          <p className="text-base font-semibold tracking-tight text-ink">{title}</p>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6 md:max-w-2xl">
        {children}
      </div>
      {footer ? (
        <div className="sticky bottom-0 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto w-full max-w-md md:max-w-2xl">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

export function PrimaryLink({ href, children }) {
  return (
    <a
      href={href}
      className="flex h-12 w-full items-center justify-center rounded-[14px] bg-green text-base font-medium text-white transition-colors duration-200 ease-out hover:bg-green-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
    >
      {children}
    </a>
  );
}

export function PrimaryButton({ children, disabled, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center rounded-[14px] bg-green text-base font-medium text-white transition-colors duration-200 ease-out hover:bg-green-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, disabled, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center rounded-[14px] border border-ink bg-white text-base font-medium text-ink transition-colors duration-200 ease-out hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryLink({ href, children }) {
  return (
    <a
      href={href}
      className="flex h-12 w-full items-center justify-center rounded-[14px] border border-ink bg-white text-base font-medium text-ink transition-colors duration-200 ease-out hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
    >
      {children}
    </a>
  );
}
