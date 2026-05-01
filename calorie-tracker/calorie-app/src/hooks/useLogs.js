import { useState, useEffect } from 'react';
import { logsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export function useLogs(date) {
  const { setLogs } = useApp();
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await logsAPI.getByDate(date);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData) => {
    await logsAPI.create(logData);
    await fetchLogs();
  };

  const deleteLog = async (id) => {
    await logsAPI.delete(id);
    await fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [date]);

  return { loading, addLog, deleteLog, fetchLogs };
}