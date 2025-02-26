import moment from "moment";
import React from "react";
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { RenderCustomLegend } from "./CustomLegend";

const COLORS = [
  "#0000CD",
  "#00008B",
  "#1E90FF",
  "#00CED1",
  "#90EE90",
  "#8FBC8F",
  "#32CD32",
  "#B8860B",
  "#D2691E",
  "#A020F0",
  "#4B0082",
  "#FF6347",
  "#B22222",
  "#FFD700",
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(0);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={"middle"}
      dominantBaseline="central"
      style={{ fontSize: 16 }}
    >
      {/* {`${(percent * 100).toFixed(0)}%` } */}
      {percentage > 4 ? `${percentage}%` : ""}
    </text>
  );
};

const formatTime = (minutes) => {
  return moment().startOf("day").add(minutes, "minutes").format("HH[h] mm[m]");
};

const getNameKey = (data) => {
  if (data.tagName) return "tagName";
  if (data.queueName) return "queueName";
  return "name";
};

const getDataKey = (data) => {
  if (data.hasOwnProperty("avgSupportTime")) return "avgSupportTime";
  if (data.hasOwnProperty("count")) return "count";
  return "value";
};

export const ChartPie = ({ dataChart, isTime = false, counters = {} }) => {
  const dataKey = dataChart.length > 0 ? getDataKey(dataChart[0]) : "value";
  const nameKey = dataChart.length > 0 ? getNameKey(dataChart[0]) : "name";

  const hasData =
    dataChart.length > 0 && dataChart.some((entry) => entry[dataKey] !== 0);
  const chartData = hasData
    ? dataChart
    : [
        {
          [nameKey]: "Não possui atendimentos",
          [dataKey]: 1,
          color: "#CCCCCC",
          isNull: true,
        },
      ];

  return (
    <ResponsiveContainer height={850} width="100%">
      <PieChart>
        <defs>
          <filter id="shadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="5" dy="5" result="offsetblur" />
            <feFlood floodColor="rgba(0,0,0,0.5)" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <Pie
          data={chartData}
          dataKey={dataKey}
          nameKey={nameKey}
          labelLine={false}
          cx="50%"
          cy="50%"
          filter="url(#shadow)"
          outerRadius="95%"
          fill="#8884d8"
          label={renderCustomizedLabel}
          innerRadius="55%"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color ? entry.color : COLORS[index % COLORS.length]}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={
            isTime ? (value, name) => [formatTime(value), name] : undefined
          }
        />
        <Label />
        <Legend
          iconType="circle"
          align="center"
          verticalAlign="bottom"
          content={<RenderCustomLegend isTime={isTime} counters={counters} />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
