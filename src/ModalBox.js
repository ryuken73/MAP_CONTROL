import React from 'react';
import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Zoom from '@material-ui/core/Zoom';
import Grow from '@material-ui/core/Grow';

const useStyles = makeStyles((theme) => ({
  paper: props => ({
    margin: 'auto',
    height: props.contentHeight || "80%",
    width: props.contentWidth || "90%",
    // backgroundColor: theme.palette.background.paper,
    backgroundColor: props.autoPlay ? "maroon" : "white",
    border: '2px solid #000',
    boxShadow: theme.shadows[100],
    padding: theme.spacing(0.5),
  }),
}));

function SimpleModal(props) {
  const classes = useStyles(props);
  const {children} = props;
  console.log('### modal:', props)
  const {open, setOpen, autoPlay} = props;

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
        {...props}
      >
        <Zoom in={open} timeout={500}>
        {/* <Grow in={open} timeout={1500}> */}
        {/* <Fade in={open} timeout={300}>  */}
          <Box onClick={handleClose} display="flex" height="100%">
            <Box className={classes.paper}>
              {children}
            </Box>
          </Box>
        {/* </Fade> */}
        {/* </Grow> */}
        </Zoom>
      </Modal>
    </Box>
  );
}

export default React.memo(SimpleModal);