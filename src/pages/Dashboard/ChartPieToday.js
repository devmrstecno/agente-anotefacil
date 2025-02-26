import React, { useMemo, useEffect, useState, useCallback } from "react";
import useDashboard from "../../hooks/useDashboard";
import { ChartPieGroup } from "../../components/ChartPie";
import { format } from "date-fns";

export const ChartPieToday = () => {
  const { find } = useDashboard();
  const [attendantsToday, setAttendantsToday] = useState([]);
  const [tagsToday, setTagsToday] = useState([]);
  const [queueToday, setQueueToday] = useState([]);
  const [countersToday, setCountersToday] = useState([]);

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const params = useMemo(() => ({
    date_from: today,
    date_to: today,
  }), [today]);

  const getTodayData = useCallback(async () => {
    try {
      const dataToday = await find(params);
      setAttendantsToday(dataToday.attendants);
      setTagsToday(dataToday.tagCounts);
      setQueueToday(dataToday.queueCounts);
      setCountersToday(dataToday.counters);
    } catch (error) {
      console.error("Error fetching today's data", error);
    }
  }, [find, params]);

  useEffect(() => {
    getTodayData();
  }, []);

  const queueUsage = useMemo(() => {
    return queueToday.map((q) => ({
      ...q,
      name: q.queueName === null ? "Sem Fila" : q.queueName,
    }));
  }, [queueToday]);

  return (
    <ChartPieGroup
      counters={countersToday}
      queueUsage={queueUsage}
      tagsUsage={tagsToday}
      ticketsTimeUsage={attendantsToday}
    />
  );
};
