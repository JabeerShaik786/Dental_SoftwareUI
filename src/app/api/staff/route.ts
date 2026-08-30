import { createClient as createServerClientInstance } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const serverSupabase = await createServerClientInstance()
    const { data: { user } } = await serverSupabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch role
    const { data: profile, error: profileErr } = await serverSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      
    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }
    
    // Parse payload
    const body = await request.json()
    const { email, password, fullName, role, customTitle, phone, status } = body
    
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Initialize Supabase Admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error: Service role key missing' }, { status: 500 })
    }
    
    const adminSupabase = createClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Create user in auth.users
    const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role
      }
    })
    
    if (authErr || !authData.user) {
      return NextResponse.json({ error: authErr?.message || 'Failed to create authentication account' }, { status: 400 })
    }
    
    const userId = authData.user.id
    
    // Insert profile record
    const { data: profileRecord, error: insertErr } = await adminSupabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        role: role,
        custom_title: customTitle || role,
        phone: phone || '+91 98765 00000',
        status: status || 'Active',
        has_login: true
      })
      .select()
      .single()
      
    if (insertErr) {
      // Rollback Auth user to avoid orphaned accounts
      await adminSupabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: insertErr.message || 'Failed to create profile record' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, profile: profileRecord })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
