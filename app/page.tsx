import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');
  
  // If authenticated, redirect to dashboard
  if (authCookie?.value === 'authenticated') {
    redirect('/dashboard');
  }
  
  // Otherwise redirect to login
  redirect('/login');
}
