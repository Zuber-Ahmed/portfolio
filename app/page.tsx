import Portfolio from './components/Portfolio/page';
import WeddingMaintenance from './components/WeddingMaintenance/WeddingMaintenance';
export default function HomePage() {
  const isWeddingMaintenance = process.env.WEDDING_EVENT_MODE === 'true'; // Example condition to switch between Portfolio and WeddingMaintenance
  return isWeddingMaintenance ? <WeddingMaintenance /> : <Portfolio />;
}