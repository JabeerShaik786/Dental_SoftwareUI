import { createClient as createServerClientInstance } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'
  const numbers = '23456789'
  const symbols = '!@#$%^&*'
  const all = uppercase + lowercase + numbers + symbols

  let password = ''
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += symbols.charAt(Math.floor(Math.random() * symbols.length))

  for (let i = 0; i < 8; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length))
  }

  return password.split('').sort(() => 0.5 - Math.random()).join('')
}

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
      
    if (profileErr || !profile || profile.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }
    
    // Parse payload
    const body = await request.json()
    const { email, password, fullName, role, customTitle, phone, status } = body
    
    if (!email || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields: email, fullName, and role are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    if (role !== 'receptionist') {
      return NextResponse.json({ error: 'Invalid role: Owner can only create Receptionist accounts' }, { status: 400 })
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
    
    // Server-side strong temporary password generation
    const tempPassword = password || generateTemporaryPassword()

    // Create user in auth.users
    const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        role: 'receptionist'
      }
    })
    
    if (authErr || !authData.user) {
      return NextResponse.json({ error: authErr?.message || 'Failed to create authentication account' }, { status: 400 })
    }
    
    const userId = authData.user.id
    
    // Update/Upsert profile record created by on_auth_user_created trigger
    const { data: profileRecord, error: upsertErr } = await adminSupabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName.trim(),
        role: 'receptionist',
        custom_title: customTitle?.trim() || 'Receptionist',
        phone: phone?.trim() || '+91 98765 00000',
        status: status || 'Active',
        has_login: true
      }, { onConflict: 'id' })
      .select()
      .single()
      
    if (upsertErr) {
      // Rollback Auth user to avoid orphaned accounts
      await adminSupabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: upsertErr.message || 'Failed to update staff profile record' }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      profile: profileRecord,
      temporaryPassword: tempPassword,
      email: cleanEmail
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const serverSupabase = await createServerClientInstance()
    const { data: { user } } = await serverSupabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check requesting user role
    const { data: profile, error: profileErr } = await serverSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      
    if (profileErr || !profile || profile.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }
    
    // Parse target staff ID
    const url = new URL(request.url)
    const targetId = url.searchParams.get('id')
    
    if (!targetId) {
      return NextResponse.json({ error: 'Staff member ID is required' }, { status: 400 })
    }
    
    if (targetId === user.id) {
      return NextResponse.json({ error: 'Cannot delete the active clinic owner account' }, { status: 400 })
    }

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

    // Delete profile record from profiles
    const { error: deleteProfileErr } = await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', targetId)

    if (deleteProfileErr) {
      return NextResponse.json({ error: deleteProfileErr.message || 'Failed to delete staff profile' }, { status: 400 })
    }

    // Delete Auth user
    const { error: deleteAuthErr } = await adminSupabase.auth.admin.deleteUser(targetId)
    if (deleteAuthErr) {
      console.warn("Warning: Profile deleted but Auth user deletion encountered warning:", deleteAuthErr.message)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
