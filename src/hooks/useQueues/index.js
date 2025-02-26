import api from "../../services/api";
import { useState, useEffect } from "react";
import toastError from "../../errors/toastError";

const useQueues = () => {
  const [loading, setLoading] = useState(true);
  const [queueIds, setQueueIds] = useState([]);

  const findAll = async () => {
    const { data } = await api.get("/queue");
    return data;
  };
  const fetchQueueIds = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/queue");
      setQueueIds(data.map((item) => item.id));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchQueueIds();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  return { findAll, queueIds, loading };
};

export default useQueues;
