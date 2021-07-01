import React from 'react';
import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: props => ({
    margin: 'auto',
    height: props.contentHeight || "80%",
    width: props.contentWidth || "90%",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[100],
    padding: theme.spacing(1),
  }),
}));

export default function SimpleModal(props) {
  const classes = useStyles(props);
  const {children} = props;
  // getModalStyle is not a pure function, we roll the style only on the first render
  // const [open, setOpen] = React.useState(false);
  const {open, setOpen} = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Box onClick={handleClose} display="flex" height="100%">
          <Box className={classes.paper}>
            {children}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}