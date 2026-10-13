export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full cursor-pointer rounded-xl bg-accent px-6 py-4 font-mono text-sm font-semibold tracking-[0.2em] text-ink uppercase transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30"
    />
  )
}
