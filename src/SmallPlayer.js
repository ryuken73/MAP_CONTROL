import React from 'react'
import Box from '@material-ui/core/Box';
import {SmallPaddingIconButton} from './template/smallComponents';
import HLSPlayer from './HLSPlayer';
import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

const SmallPlayer = props => {
    const {
        currentTitle="Player",
        playerSource=null,
        closeVideo=()=>{},
        maximizeVideo=()=>{},
        setPlayer=()=>{}
    } = props;
    return (
        <>
            <Box display="flex" p="5px" color="white" fontSize="18px" bgcolor="black" minWidth="350px">
                <Box mr="auto">
                    <SmallPaddingIconButton>
                        <CloseIcon
                        fontSize="default"
                        style={{color:"grey"}}
                        onClick={closeVideo}
                        ></CloseIcon>
                    </SmallPaddingIconButton>
                </Box>
                <Box m="auto" width="100%">
                    {currentTitle}      
                </Box>
                <Box ml="auto">
                    <SmallPaddingIconButton>
                        <FullscreenIcon
                            fontSize="default"
                            style={{color:"grey"}}
                            onClick={maximizeVideo}
                        ></FullscreenIcon>
                    </SmallPaddingIconButton>
                </Box>
            </Box>
            <HLSPlayer 
                width={350}
                height={200}
                fluid={false}
                source={playerSource}
                setPlayer={setPlayer}
            ></HLSPlayer>
        </>
    )
}

export default React.memo(SmallPlayer)