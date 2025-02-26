import React, { useState, useEffect, useMemo } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";

// ICONS
import SpeedIcon from "@material-ui/icons/Speed";
import Icon from "@material-ui/icons/";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import TodayIcon from "@material-ui/icons/Today";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import AddIcon from "@material-ui/icons/Add";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ForumIcon from "@material-ui/icons/Forum";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import MessageIcon from "@material-ui/icons/Message";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import useDashboard from "../../hooks/useDashboard";
import useCompanies from "../../hooks/useCompanies";
import { isEmpty } from "lodash";
import moment from "moment";
import Title from "./Title";

import { ChartPieGroup } from "../../components/ChartPie";
import { ChartPieToday } from "./ChartPieToday";
import { CardDasboard } from "./Card";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  testeGridButton: {
    borderRadius: "50%",
  },
  whiteText: {
    color: "white",
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  autoheightPaper: {
    height: "100%",
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  titleBlue: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.boxticket.main
        : theme.palette.primary.main,
    color: "#eee",
  },
  cardBlue: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.boxticket.main
        : theme.palette.primary.main,
    color: "#eee",
  },
  iconStyle: {
    fontSize: 100,
    color: "#fffff",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [tags, setTags] = useState([]);
  const [queue, setQueue] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [companyDueDate, setCompanyDueDate] = useState();
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const { finding } = useCompanies();

  useEffect(() => {}, []);
  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
      setTags(data.tagCounts);
      setQueue(data.queueCounts);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  const queueUsage = useMemo(() => {
    return queue.map((queue) => ({
      ...queue,
      name: queue.queueName === null ? "Sem Fila" : queue.queueName,
    }));
  }, [queue]);

  useEffect(() => {
    async function fetchData() {
      await loadCompanies();
    }
    fetchData();
  }, []);
  //let companyDueDate = localStorage.getItem("companyDueDate");
  //const companyDueDate = localStorage.getItem("companyDueDate").toString();
  const companyId = localStorage.getItem("companyId");
  const loadCompanies = async () => {
    setLoading(true);
    try {
      const companiesList = await finding(companyId);
      setCompanyDueDate(moment(companiesList.dueDate).format("DD/MM/yyyy"));
    } catch (e) {
      console.log("🚀 Console Log : e", e);
    }
    setLoading(false);
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="period-selector-label">Período</InputLabel>
            <Select
              labelId="period-selector-label"
              id="period-selector"
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
            >
              <MenuItem value={0}>Nenhum selecionado</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
            <FormHelperText>Selecione o período desejado</FormHelperText>
          </FormControl>
        </Grid>
      );
    }
  }

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-end">
          {/* GRID DO VENCIMENTO */}
          {/* <Grid item xs={12} sm={6} md={3}>
            <CardCounter
              icon={<TodayIcon fontSize="inherit" />}
              title="Data Vencimento"
              value={companyDueDate}
              loading={loading}
            />
          </Grid> */}
          {/* Dashboard Pizza atendimentos do dia */}
          <Grid item xs={12}>
            <Paper className={classes.titleBlue}>
              <Typography
                className={classes.whiteText}
                align="center"
                variant="h4"
                component="h2"
              >
                Atendimentos hoje
              </Typography>
            </Paper>
          </Grid>
          <ChartPieToday />

          {/* DASHBOARD ATENDIMENTOS HOJE */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart />
            </Paper>
          </Grid>
          {/* ATENDIMENTOS PENDENTES */}
          <CardDasboard
            titleCard={"Atd. Pendentes"}
            counters={counters.supportPending}
            icon={<CallIcon className={classes.iconStyle} />}
            styleBackground="1"
          />
          {/* T.M. DE ATENDIMENTO */}
          <CardDasboard
            titleCard={"T.M. de Atendimento"}
            counters={formatTime(counters.avgSupportTime)}
            icon={<AccessAlarmIcon className={classes.iconStyle} />}
            styleBackground="2"
          />
          {/* ATENDIMENTOS REALIZADOS */}
          <CardDasboard
            titleCard={"Finalizados"}
            counters={counters.supportFinished}
            icon={<CheckCircleIcon className={classes.iconStyle} />}
            styleBackground="1"
          />
          {/* NOVOS CONTATOS */}
          <CardDasboard
            titleCard={"Novos Contatos"}
            counters={counters.leads}
            icon={<AddIcon className={classes.iconStyle} />}
            styleBackground="3"
          />

          {/* ATENDIMENTOS ACONTECENDO */}
          <CardDasboard
            titleCard={"Atd. Acontecendo"}
            counters={counters.supportHappening}
            icon={<HourglassEmptyIcon className={classes.iconStyle} />}
            styleBackground="1"
          />

          {/* T.M. DE ESPERA */}
          <CardDasboard
            titleCard={"T.M. de Espera"}
            counters={formatTime(counters.avgWaitTime)}
            icon={<TimerIcon className={classes.iconStyle} />}
            styleBackground="2"
          />

          {/* USUARIOS ONLINE */}
          <Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
          </Grid>

          <Grid item xs={12}>
            <Paper className={classes.titleBlue}>
              <Typography
                className={classes.whiteText}
                align="center"
                variant="h4"
                component="h2"
              >
                Filtro por data
              </Typography>
            </Paper>
          </Grid>

          {/* FILTROS */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filterType}
                onChange={(e) => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
              <FormHelperText>Selecione o período desejado</FormHelperText>
            </FormControl>
          </Grid>

          {renderFilters()}

          {/* BOTAO FILTRAR */}
          <Grid item xs={12} className={classes.alignRight}>
            <ButtonWithSpinner
              loading={loading}
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              Filtrar
            </ButtonWithSpinner>
          </Grid>
          {/* Dashboard Pizza por data */}
          <ChartPieGroup
            counters={counters}
            queueUsage={queueUsage}
            tagsUsage={tags}
            ticketsTimeUsage={attendants}
          />
          {/* ATENDIMENTOS REALIZADOS */}
          <CardDasboard
            titleCard={"Finalizados"}
            counters={counters.supportFinished}
            icon={<CheckCircleIcon className={classes.iconStyle} />}
            column={true}
            styleBackground="1"
          />
          {/* NOVOS CONTATOS */}
          <CardDasboard
            titleCard={"Novos Contatos"}
            counters={counters.leads}
            icon={<AddIcon className={classes.iconStyle} />}
            column={true}
            styleBackground="2"
          />
          {/* ATENDIMENTOS ACONTECENDO */}
          <CardDasboard
            titleCard={"Atd. Acontecendo"}
            counters={counters.supportHappening}
            icon={<HourglassEmptyIcon className={classes.iconStyle} />}
            column={true}
            styleBackground="1"
          />
          {/* T.M. DE ESPERA */}
          <CardDasboard
            titleCard={"T.M. de Espera"}
            counters={formatTime(counters.avgWaitTime)}
            icon={<TimerIcon className={classes.iconStyle} />}
            column={true}
            styleBackground="3"
          />
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
