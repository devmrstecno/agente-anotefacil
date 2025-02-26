import React from "react";
import { Skeleton } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  laneSkeleton: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "#f0f0f0",
    borderRadius: theme.spacing(1),
    width: "100%",
  },
  cardSkeleton: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: "#e0e0e0",
    borderRadius: theme.spacing(1),
  },
}));

const KanbanSkeleton = () => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} style={{ height: "100%", overflowX: "auto" }}>
      {[1, 2, 3, 4, 5, 6].map((lane) => (
        <Grid item xs={2} key={lane}>
          <Box className={classes.laneSkeleton}>
            <Skeleton variant="text" width="60%" height={30} />
            {[1, 2, 3].map((card) => (
              <Box key={card} className={classes.cardSkeleton}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rect" height={20} width="100%" />
              </Box>
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default KanbanSkeleton;
