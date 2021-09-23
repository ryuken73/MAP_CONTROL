import React from 'react'
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import {SmallButton} from './template/smallComponents';
import SimpleSlide from './SimpleSlide';
import colors from './lib/colors';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import styled from 'styled-components';

const { grey } = colors;

const BasicIconButton = styled(IconButton)`
    padding: ${props => props.padding || "5px"};
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
        gotoLocation=()=>{},
        setFilterOpen=()=>{}
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
                    <FilterListIcon fontSize="small" />
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
                    초기화
                </SmallButton>
                {areas.length > 0 && areas.map((area, index) => (
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
        {areas.map((area, areaIndex) => (
            <AbsolutePositionBox
            key={area}
            width="auto"
            height="auto"
            top={107+areaIndex*35}
            left="100px"
            // display={locationDisplay[areaIndex]}
            >
            <TransparentPaper>
                {cctvsInAreas.get(area).length > 0 && cctvsInAreas.get(area).map((cctv,cctvIndex) => (
                <SimpleSlide
                    key={cctv.id}
                    transitionDelay={cctvIndex*50}
                    show={locationDisplay[areaIndex]==='block'}
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
                        onClick={gotoLocation}
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
      </>
    )
}

export default LeftMenu;
