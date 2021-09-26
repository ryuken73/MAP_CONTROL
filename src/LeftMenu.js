import React from 'react'
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import {SmallButton} from './template/smallComponents';
import SimpleSlide from './SimpleSlide';
import colors from './lib/colors';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import styled from 'styled-components';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import SettingsIcon from '@material-ui/icons/Settings';

const { grey } = colors;

const BasicIconButton = styled(IconButton)`
    padding: ${props => props.padding || "2px"};
    background-color: ${grey[700]};
    .MuiIconButton-label {
        .MuiSvgIcon-root {
            color: ${props => props.iconcolor || 'white'};
        }
    }
`

const LeftMenu = props => {
    const {
        areas=[],
        currentArea='',
        locationDisplay=[],
        currentId=null,
        cctvsInAreas=new Map(),
        onClickInit=()=>{},
        onClickArea=()=>{},
        onClickCCTVinMenu=()=>{},
        setFilterOpen=()=>{},
        groupByArea=true,
        preload=false
    } = props;

    const openFilterModal = React.useCallback(() => {
        setFilterOpen(true);
    },[setFilterOpen])

    return (
        <>
        <AbsolutePositionBox
            width="auto"
        >
            <TransparentPaper>
                <BasicIconButton 
                    aria-label="delete" 
                    onClick={openFilterModal}
                >
                    <SettingsIcon fontSize="small" />
                </BasicIconButton>
                <SmallButton
                    style={{display:'block'}}
                    fontsize="15px"
                    mt="15px"
                    width="80px"
                    onClick={onClickInit}
                    bgcolor={grey[700]}
                    hoverColor={grey[600]} 
                >
                    Home
                </SmallButton>
                {groupByArea && areas.length > 0 && areas.map((area, index) => (
                    <SimpleSlide 
                        key={area}
                        transitionDelay={index*50}
                        timeout={300}
                    >
                        <SmallButton
                            style={{display:'block'}}
                            fontsize="15px"
                            mt="5px"
                            width="80px"
                            onClick={onClickArea}
                            bgcolor={currentArea !== area ? grey[400]:grey[900]}
                            // activeColor={grey[900]}
                            hoverColor={grey[600]} 
                        >
                            {area}
                        </SmallButton>
                    </SimpleSlide>

                ))}
            </TransparentPaper>
        </AbsolutePositionBox>
        {groupByArea && areas.map((area, areaIndex) => (
            <AbsolutePositionBox
                key={area}
                width="auto"
                height="auto"
                top={107+areaIndex*35}
                left={"100px"}
                // display={locationDisplay[areaIndex]}
            >
            <TransparentPaper>
                {groupByArea && cctvsInAreas.get(area).length > 0 && cctvsInAreas.get(area).map((cctv,cctvIndex) => (
                <SimpleSlide
                    key={cctv.cctvId}
                    transitionDelay={cctvIndex*50}
                    show={!groupByArea ? true : locationDisplay[areaIndex]==='block'}
                    timeout={300}
                    mountOnEnter 
                    unmountOnExit
                >
                    <SmallButton
                        key={cctv.cctvId}
                        id={cctv.cctvId}
                        style={{display:'block'}}
                        fontsize="15px"
                        mt="5px"
                        width="auto"
                        onClick={onClickCCTVinMenu}
                        hoverColor={grey[600]}
                        activeColor={grey[900]}
                        bgcolor={cctv.cctvId === currentId ? grey[900]:grey[400]}
                        >
                        {cctv.title}  
                    </SmallButton>
                </SimpleSlide>
                ))}
            </TransparentPaper>
            </AbsolutePositionBox>
        ))}
        {!groupByArea && [...cctvsInAreas.values()].flat().map((cctv,cctvIndex) => (
            <AbsolutePositionBox
                key={cctv.cctvId}
                width="auto"
                height="auto"
                top={107+cctvIndex*35}
                left={preload ? 80:0}
                // display={locationDisplay[areaIndex]}
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
                        <SmallButton
                            key={cctv.cctvId}
                            id={cctv.cctvId}
                            style={{display:'block'}}
                            fontsize="15px"
                            mt="5px"
                            width="auto"
                            onClick={onClickCCTVinMenu}
                            hoverColor={grey[600]}
                            activeColor={grey[900]}
                            bgcolor={cctv.cctvId === currentId ? grey[900]:grey[400]}
                            >
                            {cctv.title}  
                        </SmallButton>
                    </SimpleSlide>
                </TransparentPaper>
            </AbsolutePositionBox>    
        ))}
      </>
    )
}

export default LeftMenu;
