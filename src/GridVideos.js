import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import SimpleSlide from './SimpleSlide';
import HLSPlayer from './HLSPlayer';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';

const Container = styled.div`
    /* height: 100%; */
    display: grid;
    grid-template-columns: 1fr 1fr 1fr ;
    grid-template-rows: 1fr 1fr 1fr ;
    /* align-items: stretch; */
`

const GridVideos = props => {
    const {
        preLoadMapRef=null,
        cctvsSelected=[],
        setPlayer,
        maximizeGrid,
        toggleAutoPlay
    } = props;

    // const cctvs = [...cctvsInAreas.values()].flat();

    console.log('#', cctvsSelected)
    const addToPreloadMap = element => {
        if(element === null) return;
        const cctvId = element.id;
        const preloadMap = preLoadMapRef.current;
        preloadMap.set(cctvId, element);
    }

    useHotkeys('1', () => maximizeGrid('0'), [maximizeGrid])
    useHotkeys('2', () => maximizeGrid('1'), [maximizeGrid])
    useHotkeys('3', () => maximizeGrid('2'), [maximizeGrid])
    useHotkeys('4', () => maximizeGrid('3'), [maximizeGrid])
    useHotkeys('5', () => maximizeGrid('4'), [maximizeGrid])
    useHotkeys('6', () => maximizeGrid('5'), [maximizeGrid])
    useHotkeys('7', () => maximizeGrid('6'), [maximizeGrid])
    useHotkeys('8', () => maximizeGrid('7'), [maximizeGrid])
    useHotkeys('9', () => maximizeGrid('8'), [maximizeGrid])
    useHotkeys('a', () => toggleAutoPlay(), [toggleAutoPlay])

    return (
        <Container>
            {cctvsSelected.map((cctv,cctvIndex) => (
            // <AbsolutePositionBox
            //     key={cctv.cctvId}
            //     width="auto"
            //     height="auto"
            //     top={112+cctvIndex*35}
            //     left={15}
            // >
            //     <TransparentPaper>
            //         <SimpleSlide
            //             key={cctv.cctvId}
            //             transitionDelay={cctvIndex*50}
            //             show={true}
            //             timeout={300}
            //             mountOnEnter 
            //             unmountOnExit
            //         >
                        <Box key={cctv.cctvId} id={cctv.cctvId} ref={addToPreloadMap} minWidth="60px">
                            <div style={{padding:"1px", borderColor:"black", border:"solid 1px black", background:'white'}}>
                            
                            <HLSPlayer 
                                width={350}
                                height={200}
                                fluid={false}
                                source={cctv}
                                setPlayer={setPlayer}
                            ></HLSPlayer>
                            </div>
                        </Box>
            //         </SimpleSlide>
            //     </TransparentPaper>
            // </AbsolutePositionBox>    
            ))}
      </Container>
    )
}

export default React.memo(GridVideos);
