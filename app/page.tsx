import Portfolio from '@/app/components/Portfolio/Portfolio';
import { getServerConfig } from '@/app/config/server';

import WeddingMaintenance from './components/WeddingMaintenance/WeddingMaintenance';
export default function HomePage() {
  const isWeddingMaintenance = getServerConfig().weddingEventMode;
  return isWeddingMaintenance ? <WeddingMaintenance /> : <Portfolio />;
}
