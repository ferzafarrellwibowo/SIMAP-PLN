import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabaseServer'

export async function GET() {
  const { data, error } = await supabaseServer.from('projects').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, description, owner } = body
  const { data, error } = await supabaseServer.from('projects').insert([{ title, description, owner }])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
