import React from "react";
import { Grid, Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { ChartPie } from "./ChartPie";

const useStyles = makeStyles((theme) => ({
  autoheightPaper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
}));

const defaultDataChart = [
  {
    name: "Não Possui Atendimentos",
    count: 1,
    color: "#CCCCCC",
    isNull: true,
  },
];

export const ChartPieGroup = ({
  ticketsTimeUsage = defaultDataChart,
  counters,
  tagsUsage = defaultDataChart,
  queueUsage = defaultDataChart,
}) => {
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Grid container item spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper className={classes.autoheightPaper}>
            <Typography
              color="primary"
              variant="h6"
              gutterBottom
              className={classes.titleChart}
            >
              {i18n.t("dashboard.charts.avgTime.title")}
            </Typography>
            <ChartPie dataChart={ticketsTimeUsage} isTime counters={counters} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper className={classes.autoheightPaper}>
            <Typography color="primary" variant="h6" gutterBottom>
              {i18n.t("dashboard.charts.tagUsage.title")}
            </Typography>
            <ChartPie dataChart={tagsUsage} counters={counters} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper className={classes.autoheightPaper}>
            <Typography color="primary" variant="h6" gutterBottom>
              {i18n.t("dashboard.charts.queueUsage.title")}
            </Typography>
            <ChartPie dataChart={queueUsage} counters={counters} />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
