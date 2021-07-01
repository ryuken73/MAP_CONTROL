import React from 'react'
import Switch from '@material-ui/core/Switch';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const AntSwitch = withStyles((theme) => ({
    root: {
      width: 28,
      height: 16,
      padding: 0,
      display: 'flex',
    },
    switchBase: {
      padding: 2,
        color: theme.palette.common.white,  
        '&$checked': {
        transform: 'translateX(12px)',
        color: theme.palette.common.white,
        '& + $track': {
          opacity: 1,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
        },
      },
    },
    thumb: {
      width: 12,
      height: 12,
      boxShadow: 'none',
    },
    track: {
    //   border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: theme.palette.primary.main,
    },
    checked: {},
  }))(Switch);

function BasicSwitch(props) {
    const {onChange=()=>{}, disabled=true, defaultChecked=false} = props;
    const [checked, setChecked] = React.useState(false);
    React.useEffect(() => {
        setChecked(defaultChecked)
    },[defaultChecked])
    const handleChange = event => {
        console.log(event.currentTarget.checked);
        setChecked(event.currentTarget.checked);
        onChange(event.currentTarget.checked);
    }
    return (
        <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
            <Grid item>Main</Grid>
            <Grid item>
                <AntSwitch checked={checked} onChange={handleChange} name="select" />
            </Grid>
            <Grid item>Sub</Grid>
            </Grid>
        </Typography>
    )
}

export default React.memo(BasicSwitch)
