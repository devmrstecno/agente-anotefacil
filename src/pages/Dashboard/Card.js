import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, CardContent, Card } from "@material-ui/core";

const gradients = {
  1: "linear-gradient(60deg, #0268BC, #31ABE4BC)",
  2: "linear-gradient(60deg, #f79c2c, #EECE40)",
  3: "linear-gradient(60deg, #D2691E, #EC9A3CBC)",
};

const useStyles = makeStyles((theme) => ({
  cardBlue: (props) => ({
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    height: "100%",
    borderRadius: "20px",
    background: gradients[props.styleBackground],
    color: "#ffff",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "row",
      textAlign: "left",
    },
  }),
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2),
    },
  },
}));

export const CardDasboard = ({
  counters = 0,
  titleCard = "Title",
  icon = null,
  column = false,
  styleBackground,
}) => {
  const classes = useStyles({ styleBackground });
  return (
    <Grid
      item
      xs={12}
      md={column ? 3 : 4}
      sm={6}
      lg={column ? 6 : 4}
      xl={column ? 3 : 4}
    >
      <Card className={classes.cardBlue} elevation={10}>
        <CardContent className={classes.content}>
          <Typography component="h3" variant="h5" paragraph>
            {titleCard}
          </Typography>
          <Typography component="h1" variant="h4">
            {counters}
          </Typography>
        </CardContent>
        <div>{icon}</div>
      </Card>
    </Grid>
  );
};
