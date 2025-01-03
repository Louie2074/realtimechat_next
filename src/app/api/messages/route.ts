import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const MESSAGES_PER_PAGE = 20;

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MESSAGES_PER_PAGE);

    if (error) throw error;

    // Return messages in ascending order for display
    return NextResponse.json(data.reverse());
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const json = await request.json();
    const { message, email } = json;

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          message: message.trim(),
          email: email,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating message' },
      { status: 500 }
    );
  }
}
