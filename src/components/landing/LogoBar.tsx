'use client'

const logos = [
  {
    name: 'Stripe',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
      </svg>
    ),
  },
  {
    name: 'Google Analytics',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
        <path d="M22.84 2.9982v17.9987c.0086 1.6473-1.3197 2.9897-2.967 2.9984a2.9808 2.9808 0 01-.3677-.0208c-1.528-.226-2.6477-1.5558-2.6105-3.1V3.1204c-.0369-1.5458 1.0856-2.8762 2.6157-3.1 1.6361-.1915 3.1178.9796 3.3093 2.6158.014.1201.0208.241.0202.3619zM4.1326 18.0548c-1.6417 0-2.9726 1.331-2.9726 2.9726C1.16 22.6691 2.4909 24 4.1326 24s2.9726-1.3309 2.9726-2.9726-1.331-2.9726-2.9726-2.9726zm7.8728-9.0098c-.0171 0-.0342 0-.0513.0003-1.6495.0904-2.9293 1.474-2.891 3.1256v7.9846c0 2.167.9535 3.4825 2.3505 3.763 1.6118.3266 3.1832-.7152 3.5098-2.327.04-.1974.06-.3983.0593-.5998v-8.9585c.003-1.6474-1.33-2.9852-2.9773-2.9882z" />
      </svg>
    ),
  },
  {
    name: 'Cloudflare',
    svg: (
      <svg viewBox="0 0 128 128" fill="currentColor" className="h-9 w-9">
        <path d="M87.295 89.022c.763-2.617.472-5.015-.8-6.796-1.163-1.635-3.125-2.58-5.488-2.689l-44.737-.581c-.291 0-.545-.145-.691-.363s-.182-.509-.109-.8c.145-.436.581-.763 1.054-.8l45.137-.581c5.342-.254 11.157-4.579 13.192-9.885l2.58-6.723c.109-.291.145-.581.073-.872-2.906-13.158-14.644-22.97-28.672-22.97-12.938 0-23.913 8.359-27.838 19.952a13.35 13.35 0 0 0-9.267-2.58c-6.215.618-11.193 5.597-11.811 11.811-.145 1.599-.036 3.162.327 4.615C10.104 70.051 2 78.337 2 88.549c0 .909.073 1.817.182 2.726a.895.895 0 0 0 .872.763h82.57c.472 0 .909-.327 1.054-.8l.617-2.216z" />
        <path d="M101.542 60.275c-.4 0-.836 0-1.236.036-.291 0-.545.218-.654.509l-1.744 6.069c-.763 2.617-.472 5.015.8 6.796 1.163 1.635 3.125 2.58 5.488 2.689l9.522.581c.291 0 .545.145.691.363.145.218.182.545.109.8-.145.436-.581.763-1.054.8l-9.924.582c-5.379.254-11.157 4.579-13.192 9.885l-.727 1.853c-.145.363.109.727.509.727h34.089c.4 0 .763-.254.872-.654.581-2.108.909-4.325.909-6.614 0-13.447-10.975-24.422-24.458-24.422" />
      </svg>
    ),
  },
  {
    name: 'Convex',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
        <path d="M15.09 18.916c3.488-.387 6.776-2.246 8.586-5.348-.857 7.673-9.247 12.522-16.095 9.545a3.47 3.47 0 0 1-1.547-1.314c-1.539-2.417-2.044-5.492-1.318-8.282 2.077 3.584 6.3 5.78 10.374 5.399m-10.501-7.65c-1.414 3.266-1.475 7.092.258 10.24-6.1-4.59-6.033-14.41-.074-18.953a3.44 3.44 0 0 1 1.893-.707c2.825-.15 5.695.942 7.708 2.977-4.09.04-8.073 2.66-9.785 6.442m11.757-5.437C14.283 2.951 11.053.992 7.515.933c6.84-3.105 15.253 1.929 16.17 9.37a3.6 3.6 0 0 1-.334 2.02c-1.278 2.594-3.647 4.607-6.416 5.352 2.029-3.763 1.778-8.36-.589-11.847" />
      </svg>
    ),
  },
  {
    name: 'Anthropic',
    svg: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-9 w-9">
        <path fillRule="evenodd" d="M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z" />
      </svg>
    ),
  },
  {
    name: 'ElevenLabs',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
        <path d="M4.6035 0v24h4.9317V0zm9.8613 0v24h4.9317V0z" />
      </svg>
    ),
  },
  {
    name: 'Cartesia',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
        <rect x="0.5" y="8" width="3" height="8" rx="1" />
        <rect x="5.5" y="2" width="3" height="20" rx="1" />
        <rect x="10.5" y="5" width="3" height="14" rx="1" />
        <rect x="15.5" y="1" width="3" height="22" rx="1" />
        <rect x="20.5" y="8" width="3" height="8" rx="1" />
      </svg>
    ),
  },
]

export function LogoBar() {
  return (
    <section className="relative overflow-hidden bg-black pb-16 sm:pb-20">
      {/* Grid pattern - same as hero */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Yellow ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/8 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <p className="mb-10 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow-500/50">
          Powered by
        </p>

        <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14 md:gap-x-16">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="group flex w-16 flex-col items-center gap-2.5 sm:w-20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-500/[0.08] bg-yellow-500/[0.03] text-neutral-500 transition-all duration-300 group-hover:border-yellow-500/20 group-hover:bg-yellow-500/[0.07] group-hover:text-yellow-400/80 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.08)]">
                {logo.svg}
              </div>
              <span className="text-center text-[10px] font-medium leading-tight tracking-wide text-neutral-600 transition-colors duration-300 group-hover:text-neutral-400 sm:text-[11px]">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
