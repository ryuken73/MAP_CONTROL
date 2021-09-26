import React from 'react'
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import SimpleSlide from './SimpleSlide';
import HLSPlayer from './HLSPlayer';
import Box from '@material-ui/core/Box';

const LeftMenu = props => {
    const {
        cctvsInAreas=new Map(),
        urls=[],
        preLoadMapRef=null
    } = props;

    const cctvs = [...cctvsInAreas.values()].flat();

    const addToPreloadMap = element => {
        if(element === null) return;
        const cctvId = element.id;
        const preloadMap = preLoadMapRef.current;
        preloadMap.set(cctvId, element);
        // preloadMap.set(element.id, element);
        // console.log('####',element)
        // console.log(element.id)
    }

    const setPlayer = () => {};

    return (
        <>
            {cctvs.map((cctv,cctvIndex) => (
            <AbsolutePositionBox
                key={cctv.cctvId}
                width="auto"
                height="auto"
                top={112+cctvIndex*35}
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
                            <HLSPlayer 
                                width={350}
                                height={200}
                                fluid={false}
                                source={urls.find(url => url.cctvId === cctv.cctvId )}
                                setPlayer={setPlayer}
                            ></HLSPlayer>
                        </Box>
                    </SimpleSlide>
                </TransparentPaper>
            </AbsolutePositionBox>    
            ))}
      </>
    )
}

export default React.memo(LeftMenu);
