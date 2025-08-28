import InputForm from '@/components/InputForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          SNS & Blog Post Generator
        </h1>
        <InputForm />
      </div>
    </main>
  );
}
