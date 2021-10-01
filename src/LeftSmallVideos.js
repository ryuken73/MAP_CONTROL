import React from 'react'
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import SimpleSlide from './SimpleSlide';
import HLSPlayer from './HLSPlayer';
import Box from '@material-ui/core/Box';

const LeftMenu = props => {
    const {
        preLoadMapRef=null,
        cctvsSelected=[],
        setPlayer
    } = props;

    // const cctvs = [...cctvsInAreas.values()].flat();

    console.log('#', cctvsSelected)
    const addToPreloadMap = element => {
        if(element === null) return;
        const cctvId = element.id;
        const preloadMap = preLoadMapRef.current;
        preloadMap.set(cctvId, element);
        // preloadMap.set(element.id, element);
        // console.log('####',element)
        // console.log(element.id)
    }

    // const setPlayer = () => {};

    return (
        <>
            {cctvsSelected.map((cctv,cctvIndex) => (
            <AbsolutePositionBox
                key={cctv.cctvId}
                width="auto"
                height="auto"
                top={112+cctvIndex*35}
                left={15}
            >
                <TransparentPaper>
                    <SimpleSlide
                        key={cctv.cctvId}
                        transitionDelay={cctvIndex*50}
                        show={true}
                        timeout={300}
                        mountOnEnter 
                        unmountOnExit
                    >
                        <Box id={cctv.cctvId} ref={addToPreloadMap} minWidth="60px">
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
                    </SimpleSlide>
                </TransparentPaper>
            </AbsolutePositionBox>    
            ))}
      </>
    )
}

export default React.memo(LeftMenu);
