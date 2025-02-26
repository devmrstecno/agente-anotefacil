import moment from "moment";
import React from "react";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import { List, ListItemText } from "@material-ui/core";

export const RenderCustomLegend = (props) => {
  const { payload, isTime, counters } = props;

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }
 // const { ticketsOpen, ticketsClosed, ticketsInProgress } = ticketStatusCount;
  const containerStyle = {
    paddingTop: "5px",
    padding: "5px",
    display: "flex",
    height: "300px",
    flexDirection: "column",
    overflow: "hidden",
  };

  const listStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    width: "100%",
    marginBotton: 0,
    overflowY: "auto",
    justifyContent: "flex-start",
  };

  const listItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <li
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          justifyContent: "center",
        }}
      >
        <span>{`Atendimentos Abertos - ${counters.supportPending || 0}`}</span>
        <span>{`Atendimentos Aguardando - ${counters.supportHappening || 0}`}</span>
        <span>{`Atendimentos Resolvidos - ${counters.supportFinished || 0}`}</span>
      </li>
      <List style={listStyle}>
        {payload.map((entry, index) => (
          <li
            key={`legend-item-${index}`}
            style={{ ...listItemStyle, color: entry.color }}
          >
            <FiberManualRecordIcon
              style={{ fontSize: 15, color: entry.color }}
            />
            {!entry.payload.isNull ? (
              <ListItemText
                primary={`${entry.value} - ${
                  isTime ? formatTime(entry.payload.value) : entry.payload.value
                }`}
              />
            ) : (
              <ListItemText primary={`${entry.value}`} />
            )}
          </li>
        ))}
      </List>
    </div>
  );
};
