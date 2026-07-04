import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Atomic AI
        </h1>
        <p className="text-gray-400">Production-ready AI SaaS Platform</p>
      </div>
      <RegisterForm />
    </div>
  );
}
