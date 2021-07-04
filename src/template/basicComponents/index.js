import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import deepPurple from '@material-ui/core/colors/deepPurple';
import teal from '@material-ui/core/colors/teal';
import blueGrey from '@material-ui/core/colors/blueGrey';

const defaultBgColor = deepPurple[800];
const defaultFontColor = 'white';

const BasicButton  = styled(Button)`
    margin-top: ${props => props.mt || "2px"};
    margin-bottom: ${props => props.mb || "2px"};
    margin-left: ${props => props.ml || "5px"};
    margin-right: ${props => props.mr || "5px"};
    font-size: ${props => props.fontSize || "11px"};
    padding-top: ${props => props.pt || "10px"};
    padding-bottom: ${props => props.pb || "10px"};
    padding-left: ${props => props.pl || "20px"};
    padding-right: ${props => props.pr || "20px"};
    font-color: ${props => props.fontcolor || defaultFontColor};
    background: ${props => props.bgcolor || defaultBgColor};
    height: ${props => props.height};
    min-width: ${props => props.minwidth};
    width: ${props => props.width};
    &:disabled {
        color: darkgreen;
    }
    &:hover {
        background: black;
    }
`

const BasicSelect = styled(Select)`
    .MuiSelect-root {
        padding-top: ${props => props.pt || "12px"};
        padding-bottom: ${props => props.pb || "12px"};
        background: ${props => props.bgcolor || defaultBgColor};
        color: ${props => props.fontcolor || defaultFontColor};
        font-size: ${props => props.fontSize || '13px'}
    }
`

const BasicLink = styled(Link)`
    &.MuiTypography-colorPrimary {
        color: ${props => deepPurple[props] || blueGrey[100]};
    }
`

const BasicIconButton = styled(IconButton)`
    padding: ${props => props.padding || "5px"};
    .MuiIconButton-label {
        .MuiSvgIcon-root {
            color: ${props => props.iconcolor || 'white'};
        }
    }
`

const BasicTextField = styled(TextField)`
    padding: ${props => props.padding || "0px"};
    .MuiInputBase-root {
        background: ${props => props.bgcolor || "#191d2e"};
        input {
            color: ${props => props.fontcolor || "white"};
            font-size: ${props => props.fontSize || "12px"};
        }
    }
    .MuiFormLabel-root {
        color: ${props => props.fontcolor || "white"};
    }
`
const AbsolutePositionBox = styled(Box)`
  position: absolute;
  overflow: hidden;
  z-index: 10;
  top: ${props => props.top || '30px'};
  left: ${props => props.left || '10px'};
  width: ${props => props.width || '50px'};
  height: ${props => props.height || '100%'};
  font-size: ${props => props.fontsize || '20px'};
  text-align: ${props => props.textalign || 'center'};
`

const TransparentPaper = styled(Box)`
  background-color: unset;
  opacity: 1
`

export {
    BasicButton,
    BasicSelect,
    BasicLink,
    BasicIconButton,
    BasicTextField,
    AbsolutePositionBox,
    TransparentPaper
}