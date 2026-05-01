import { useEffect, useState } from 'react';
import { logsAPI } from '../services/api';
import ChartCard from '../components/ChartCard';
import BottomNav from '../components/BottomNav';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

export default function Progress() {
  const [data, setData] = useState([]);
  useEffect(() => {
    logsAPI.getWeeklySummary().then(res => setData(res.data));
  }, []);

  return (
    <PageTransition>
      <Navbar />
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">Progress Analytics</h2>
        <ChartCard data={data} />
      </div>
      <BottomNav />
    </PageTransition>
  );
}