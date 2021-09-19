import React from 'react';
import './App.css';
import Box from '@material-ui/core/Box';
import Loading from './Loading';
import KakaoMap from './KakaoMap';
import HLSPlayer from './HLSPlayer';
import ModalBox from './ModalBox';
import SmallPlayer from './SmallPlayer';
import LeftMenu from './LeftMenu';
import cctvs from './sources';
import axios from 'axios';
import {SmallButton} from './template/smallComponents';
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import SimpleSlide from './SimpleSlide';
import cctvImage from './assets/CCTV_Camera.png';
import colors from './lib/colors';
import {setUniqAreasFromSources, groupCCTVsByArea} from './lib/sourceUtil';
import {getPosition, makeMarkerImage, showMarker, showOverlay, movePositionNSetLevel} from './lib/mapUtil';


import CONSTANTS from './constants';
const { grey } = colors;

const {
  INI_LAT,
  INI_LNG,
  INI_LEVEL,
  DEFAULT_MAP_LEVEL,
  SHOW_ON_MAP,
  MAX_MAP_LEVEL,
  CENTER_OFFSET
} = CONSTANTS;

console.log(CONSTANTS)

const CCTV_ID_JEJU = 9982;
const isJeju = cctvId => cctvId === CCTV_ID_JEJU;

const ENCRIPTED_URL_PROVIDER = process.env.REACT_APP_ENCRIPTED_URL_PROVIDER;

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
    const centerOffset =  isJeju(cctv.cctvId) ? CENTER_OFFSET[99] : CENTER_OFFSET[mapLevel];
    const modifiedLat = cctv.lat + centerOffset.lat;
    const modifiedLng = cctv.lng + centerOffset.lng;
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
  
  const onClickInit = React.useCallback(() => {
    if(map === null) return;
    setLocationDisplay(locationDisplay.fill('none'))
    setCurrentArea('');
    closeVideo();
    movePositionNSetLevel(map, INI_LAT, INI_LNG, INI_LEVEL)
  },[map, currentOverlay])

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
          <SmallPlayer
            currentTitle={currentTitle}
            playerSource={playerSource}
            closeVideo={closeVideo}
            maximizeVideo={maximizeVideo}
            setPlayer={setPlayer}
          />
        </div>
        <Box width="100%" height="100%">
          <KakaoMap
            setMap={setMap}
            setLocation={setLocation}
            setLevel={setLevel}
            maxLevel={MAX_MAP_LEVEL}
          ></KakaoMap>
          <LeftMenu
            areas={areas}
            currentArea={currentArea}
            locationDisplay={locationDisplay}
            currentId={currentId}
            cctvsInAreas={cctvsInAreas}
            onClickInit={onClickInit}
            onClickArea={onClickArea}
            gotoLocation={gotoLocation}
          ></LeftMenu>
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
