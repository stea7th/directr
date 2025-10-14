import { redirect } from 'next/navigation';

export default function AppIndex() {
  redirect('/'); // root route is your real main page
}
