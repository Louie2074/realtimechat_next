'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

type Message = {
  id: string;
  email: string;
  message: string;
  created_at: string;
};

const MESSAGES_PER_PAGE = 20;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClient();
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const loadMoreMessages = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(messages.length, messages.length + MESSAGES_PER_PAGE - 1);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data) {
      if (data.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }
      setMessages((current) => [...current, ...data.reverse()]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial message load
    const fetchInitialMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (data) setMessages(data.reverse());
    };

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Ensure the payload.new has the correct type and all required fields
          const newMessage = payload.new as Message;
          if (
            newMessage.id &&
            newMessage.email &&
            newMessage.message &&
            newMessage.created_at
          ) {
            setMessages((current) => [...current, newMessage]);
            // Scroll to bottom when new message arrives
            setTimeout(() => {
              lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreMessages();
        }
      },
      { threshold: 0.5 }
    );

    if (chatWindowRef.current?.firstElementChild) {
      observer.observe(chatWindowRef.current.firstElementChild);
    }

    return () => observer.disconnect();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!newMessage.trim() || !user) return;

    await supabase.from('messages').insert([
      {
        message: newMessage.trim(),
        email: user.email,
      },
    ]);

    setNewMessage('');
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div
        ref={chatWindowRef}
        className="w-full max-w-2xl h-[400px] border rounded-lg overflow-y-auto p-4 bg-slate-200"
      >
        {isLoading && <div className="text-center py-2">Loading...</div>}
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
