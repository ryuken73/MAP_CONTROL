import React from 'react';
import './App.css';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Loading from './Loading';
import KakaoMap from './KakaoMap';
import HLSPlayer from './HLSPlayer';
import ModalBox from './ModalBox';
import cctvs from './sources';
import axios from 'axios';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import {SmallButton, SmallPaddingIconButton} from './template/smallComponents';
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import SimpleSlide from './SimpleSlide';
import deepPurple from '@material-ui/core/colors/deepPurple';
import blueGrey from '@material-ui/core/colors/blueGrey';
import brown from '@material-ui/core/colors/brown';
import grey from '@material-ui/core/colors/grey';
import teal from '@material-ui/core/colors/teal';
import cyan from '@material-ui/core/colors/cyan';
import cctvImage from './assets/CCTV_Camera.png';

const INI_LAT = '36.813556278060986';
const INI_LNG = '127.54877209657853';
const INI_LEVEL = 13;
const DEFAULT_MAP_LEVEL = 11;
const SHOW_ON_MAP = true;
// const ENCRIPTED_URL_PROVIDER = 'http://localhost/encrypted';
const {NODE_ENV} = process.env;

const ENCRIPTED_URL_PROVIDER = process.env.REACT_APP_ENCRIPTED_URL_PROVIDER;
console.log(NODE_ENV)
console.log(ENCRIPTED_URL_PROVIDER)
const MAX_MAP_LEVEL = 13;

const CENTER_OFFSET = {
  8 : {lat:-0.03, lng:0.06},
  9 : {lat:-0.07, lng:0.14},
  10 : {lat:-0.12, lng:0.22},
  11 : {lat:-0.25, lng:0.48},
  12 : {lat:-0.37, lng:0.80},
  13 : {lat:0, lng:0}

}

const {getPosition, makeMarkerImage, showMarker, showOverlay, movePositionNSetLevel} = require('./lib/mapUtil')()

const setUniqAreasFromSources = (cctvs, setFunction) => {
  const areasOnly = cctvs.map(cctv => {
      return cctv.title.split(' ')[0]
  })
  const uniqAreas = [...new Set(areasOnly)];
  setFunction(uniqAreas);
  return uniqAreas;
}

const groupCCTVsByArea = (uniqAreas, cctvs, setFunction) => {
  const grouped = new Map();
  uniqAreas.forEach(area => {
    const cctvsInArea = cctvs.filter(cctv => {
      return cctv.title.startsWith(area);
    })
    grouped.set(area, cctvsInArea);
  })
  setFunction(grouped);
}

function App() {
  const [map, setMap] = React.useState(null);
  const [location, setLocation] = React.useState(null);
  const [level, setLevel] = React.useState(null);
  const [player, setPlayer] = React.useState(null);
  const [modalPlayer, setModalPlayer] = React.useState(null);
  const [playerDisplay, setPlayerDisplay] = React.useState('none');
  const [playerSource, setPlayerSource] = React.useState({});
  const [currentId, setCurrentId] = React.useState(null);
  const [urls, setUrls] = React.useState([]);
  const [loadingOpen, setLoadingOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [currentOverlay, setCurrentOverlay] = React.useState(null);
  const [areas, setAreas] = React.useState([]);
  const [cctvsInAreas, setCCTVsInAreas] = React.useState(new Map());
  const [locationDisplay, setLocationDisplay] = React.useState([]);
  const [currentArea, setCurrentArea] = React.useState([]);

  console.log('re-render:', cctvsInAreas)
  const playerRef = React.useRef(null);
  const currentTitle = currentId ? cctvs.find(cctv => cctv.cctvId === currentId).title : 'none'

  // get hls urls for individual cctvs
  React.useEffect(() => {
    setLoadingOpen(true);
    const uniqAreas = setUniqAreasFromSources(cctvs, setAreas);
    const locationDisplay = new Array(uniqAreas.length);
    setLocationDisplay(locationDisplay.fill('none'))
    groupCCTVsByArea(uniqAreas, cctvs, setCCTVsInAreas);
    const getUrlJob = cctvs.map(async cctv => {
      try {
        const {cctvId} = cctv;
        const response = await axios.get(ENCRIPTED_URL_PROVIDER,{params:{cctvId}});
        return {...cctv, url:response.data.url}
      } catch(err){
        return false;
      }
    })
    Promise.all(getUrlJob)
    .then(cctvsWithUrls => {
      setLoadingOpen(false)
      if(cctvsWithUrls.some(url => url === false)){
        alert(`Error getting encrypted Url. check ${ENCRIPTED_URL_PROVIDER}`)
      }
      setUrls(cctvsWithUrls)
    })
  },[])

  const markerClickHandler = (cctvId, urls) => {
    return () => {
      setCurrentId(cctvId);
      const cctv = cctvs.find(cctv => cctv.cctvId === cctvId);
      const cctvArea = cctv.title.split(' ')[0]
      setCurrentArea(cctvArea);
      selectArea(cctvArea);
      setPlayerDisplay('none');
      const targetPosition = movePositionNSetLevelById(map, cctvId);
      showSmallPlayerById(map, cctvId, urls, targetPosition, playerRef);
    }
  }

  React.useEffect(() => {
    if(map === null) return;
    const markerImageSize = new window.kakao.maps.Size(60,50);
    const markerImageOptions = {offset: new window.kakao.maps.Point(27, 50)};
    const markerImage = makeMarkerImage(cctvImage, markerImageSize, markerImageOptions);
    cctvs.forEach(cctv => {
      const targetPosition = getPosition(cctv.lat, cctv.lng);
      const marker = showMarker(map, markerImage, targetPosition);
      window.kakao.maps.event.addListener(marker, 'click', markerClickHandler(cctv.cctvId, urls))
    })
    movePositionNSetLevel(map, INI_LAT, INI_LNG, INI_LEVEL)
  },[map, urls])

  const movePositionNSetLevelById = (map, cctvId) => {
    const cctv = cctvs.find(cctv => cctv.cctvId === cctvId);
    const mapLevel = cctv.mapLevel === undefined ? DEFAULT_MAP_LEVEL : cctv.mapLevel;
    const modifiedLat = cctv.lat + CENTER_OFFSET[mapLevel].lat;
    const modifiedLng = cctv.lng + CENTER_OFFSET[mapLevel].lng;
    console.log('modified lat lng:', modifiedLat, modifiedLng, cctv.lat, cctv.lng)
    movePositionNSetLevel(map, modifiedLat, modifiedLng, mapLevel);
    const targetPosition = getPosition(cctv.lat, cctv.lng);
    return targetPosition;
  }

  const showSmallPlayerById = (map, cctvId, urls, targetPosition, playerRef) => {
    console.log('### urls:', urls)
    const playerNode = playerRef.current;
    const currentOverlay = showOverlay(map, targetPosition, playerNode);
    const cctvWithUrl = urls.find(url => url.cctvId === cctvId )
    setPlayerSource({url: 'none'})

    cctvWithUrl && setTimeout(() => {
      setPlayerDisplay('block');
      setPlayerSource({url: cctvWithUrl.url});
      // mirrorModalPlayer();
    },500)
    setCurrentOverlay(currentOverlay);
  }

  const mirrorModalPlayer = () => {
    const playerNode = playerRef.current;
    const videoElement =  playerNode.querySelector('video');
    console.log('### videoElement:', videoElement);
    const mediaStream = videoElement.captureStream();
    const modalVideoPlayer = modalPlayer.tech().el();
    modalVideoPlayer.srcObject = null;
    modalVideoPlayer.srcObject = mediaStream;
  }

  const gotoLocation = React.useCallback(event => {
    console.log('goLocation:', event, typeof(event))
    const cctvId = typeof(event) === 'number' ? event : event.target.id || event.target.parentElement.id;
    const cctvIdNum = parseInt(cctvId);
    setCurrentId(cctvIdNum);
    setPlayerDisplay('none');
    const targetPosition = movePositionNSetLevelById(map, cctvIdNum)
    if(!SHOW_ON_MAP) return;
    console.log('### urls:', urls)
    showSmallPlayerById(map, cctvIdNum, urls, targetPosition, playerRef);
  },[map, urls])

  const maximizeVideo = event => {
    mirrorModalPlayer();
    setModalOpen(true);
  }

  const closeVideo = event => {
    currentOverlay.setMap(null);
    setPlayerDisplay('none');
  }

  const selectArea = currentArea => {
    const currentAreaIndex = areas.findIndex(area => area === currentArea);
    setLocationDisplay(locationDisplay => {
      const newLocationDisplay = [...locationDisplay]
      newLocationDisplay.fill('none');
      newLocationDisplay[currentAreaIndex] = 'block'
      return newLocationDisplay
    })
    setCurrentArea(currentArea);
  }

  const onClickArea = React.useCallback(event => {
    const currentArea = typeof(event) === 'string' ? event : event.target.innerText;
    const currentAreaIndex = areas.findIndex(area => area === currentArea);
    console.log(currentAreaIndex)
    setLocationDisplay(locationDisplay => {
      const newLocationDisplay = [...locationDisplay]
      const ALREADY_SHOWN = newLocationDisplay[currentAreaIndex] === 'block';
      newLocationDisplay.fill('none');
      if(ALREADY_SHOWN) return newLocationDisplay;
      newLocationDisplay[currentAreaIndex] = 'block'
      return newLocationDisplay
    })
    setCurrentArea(currentArea);
    const cctvArray = cctvsInAreas.get(currentArea);
    gotoLocation(cctvArray[0].cctvId);
  },[areas, cctvsInAreas, gotoLocation])

  React.useEffect(()=>{
    if(location === null) return;
    console.log(`lat: ${location.getLat()}, lng: ${location.getLng()}, level: ${level}`);
  },[location, level])

  return (
    <div className="App">
      <header className="App-header">
        {/* <Box display="flex" flexDirection="row" fontSize="15px">
          <Box>
            lat:{location ? location.getLat():0}
          </Box>
          <Box ml="20px">
            lng:{location ? location.getLng():0}
          </Box>
          <Box ml="20px">
            level:{level ? level:"null"}
          </Box>
        </Box> */}
        <div ref={playerRef} style={{display: playerDisplay, padding:"3px", borderColor:"black", border:"solid 1px black", background:'white'}}>
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
        </div>
        <Box width="100%" height="100%">
          <KakaoMap
            setMap={setMap}
            setLocation={setLocation}
            setLevel={setLevel}
            maxLevel={MAX_MAP_LEVEL}
          ></KakaoMap>
          <AbsolutePositionBox
            width="auto"
          >
            <TransparentPaper>
              {areas.length > 0 && areas.map((area, index) => (
                <SimpleSlide 
                  key={area}
                  transitionDelay={index*50}
                  timeout={300}
                >
                  <SmallButton
                    style={{display:'block'}}
                    fontsize="15px"
                    mt="15px"
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
              top={30+areaIndex*45}
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
                      mt="15px"
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
        <ModalBox open={modalOpen} keepMounted={true} setOpen={setModalOpen} contentWidth="80%" contentHeight="auto">
          <HLSPlayer 
            fill={true}
            responsive={true}
            setPlayer={setModalPlayer}
            aspectRatio={"16:9"}
          ></HLSPlayer>
        </ModalBox>
        </Box>
        <Loading open={loadingOpen} setOpen={setLoadingOpen}></Loading>
      </header>
    </div>
  );
}

export default React.memo(App);
