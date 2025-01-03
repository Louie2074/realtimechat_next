'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Message } from '@/types/message';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const supabase = createClient();
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial message load
    const fetchInitialMessages = async () => {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data) {
        setMessages(data);
        // Instant jump to bottom after messages load
        setTimeout(() => {
          lastMessageRef.current?.scrollIntoView();
        }, 100);
      }
    };

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            newMessage.id &&
            newMessage.email &&
            newMessage.message &&
            newMessage.created_at
          ) {
            setMessages((current) => [...current, newMessage]);

            // Instant jump to bottom for new messages
            setTimeout(() => {
              lastMessageRef.current?.scrollIntoView();
            }, 100);
          }
        }
      )
      .subscribe();

    fetchInitialMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!newMessage.trim() || !user) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: newMessage.trim(),
        email: user.email,
      }),
    });
    setNewMessage('');
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div
        ref={chatWindowRef}
        className="w-full max-w-2xl h-[400px] border rounded-lg overflow-y-auto p-4 bg-slate-200"
      >
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className="mb-4"
          >
            <div className="text-sm text-gray-500">{msg.email}</div>
            <div className="bg-blue-50 p-3 rounded-lg shadow-md border border-blue-200">
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
