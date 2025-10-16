// Server component wrapper — safe place to set route config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ConfirmClient from './ConfirmClient';

export default function Page() {
  return <ConfirmClient />;
}
