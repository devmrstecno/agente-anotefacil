
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  MainHeaderButtonsWrapper: {
    flex: "none",
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
}));

const MainHeaderButtonsWrapper = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.MainHeaderButtonsWrapper}>{children}</div>;
};

export default MainHeaderButtonsWrapper;

