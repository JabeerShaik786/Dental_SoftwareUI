import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder'

  if (typeof window !== 'undefined') {
    // Clean up stale cookies from previous clinic project if present to avoid JWT mismatch
    if (document.cookie.includes('sb-sxfowiececnrqytbtpcb-auth-token')) {
      document.cookie =
        'sb-sxfowiececnrqytbtpcb-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;'
    }
  }

  if (!client) {
    client = createBrowserClient(url, key, {
      isSingleton: true,
      cookieOptions: {
        name: 'sb-khkxwddrkwmmmcxbreau-auth-token',
      },
    })
  }

  return client
}
