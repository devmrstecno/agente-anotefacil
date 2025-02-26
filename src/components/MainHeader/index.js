
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  contactsHeader: {
    display: "flex",
    alignItems: "center",
    padding: "10px 6px",
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    height: "64px",
  },
}));

const MainHeader = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.contactsHeader}>{children}</div>;
};

export default MainHeader;

