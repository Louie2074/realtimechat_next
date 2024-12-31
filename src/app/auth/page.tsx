'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Log in to your account' : 'Create a new account'}
        </h1>
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="mt-2"
          >
            {isLogin ? 'Create an account' : 'Log in'}
          </Button>
        </div>
      </div>
    </div>
  );
}
