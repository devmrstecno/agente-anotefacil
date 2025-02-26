import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import {
  BarChart,
  CartesianGrid,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import { i18n } from "../../translate/i18n";

import Title from "./Title";
import useTickets from "../../hooks/useTickets";

const Chart = () => {
  const theme = useTheme();

  const date = useRef(new Date().toISOString());
  const { tickets } = useTickets({ date: date.current });

  const [chartData, setChartData] = useState([
    { time: "01:00", amount: 0 },
    { time: "02:00", amount: 0 },
    { time: "03:00", amount: 0 },
    { time: "04:00", amount: 0 },
    { time: "05:00", amount: 0 },
    { time: "06:00", amount: 0 },
    { time: "07:00", amount: 0 },
    { time: "08:00", amount: 0 },
    { time: "09:00", amount: 0 },
    { time: "10:00", amount: 0 },
    { time: "11:00", amount: 0 },
    { time: "12:00", amount: 0 },
    { time: "13:00", amount: 0 },
    { time: "14:00", amount: 0 },
    { time: "15:00", amount: 0 },
    { time: "16:00", amount: 0 },
    { time: "17:00", amount: 0 },
    { time: "18:00", amount: 0 },
    { time: "19:00", amount: 0 },
    { time: "20:00", amount: 0 },
    { time: "21:00", amount: 0 },
    { time: "22:00", amount: 0 },
    { time: "23:00", amount: 0 },
    { time: "00:00", amount: 0 },
  ]);

  useEffect(() => {
    setChartData((prevState) => {
      let aux = [...prevState];

      aux.forEach((a) => {
        tickets.forEach((ticket) => {
          format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time &&
            a.amount++;
        });
      });

      return aux;
    });
  }, [tickets]);

  return (
    <React.Fragment>
      <Title>{`${i18n.t("dashboard.charts.perDay.title")}${
        tickets.length
      }`}</Title>
      <ResponsiveContainer>
        <AreaChart
          width={730}
          height={250}
          data={chartData}
          syncId="anyId"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={theme.palette.text.secondary}
          >
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              Tickets
            </Label>
          </YAxis>
          <Tooltip color={theme.palette.text.secondary} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
          />
        </AreaChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default Chart;
