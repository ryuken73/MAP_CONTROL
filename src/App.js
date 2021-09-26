import React from 'react';
import './App.css';
import Box from '@material-ui/core/Box';
import Loading from './Loading';
import KakaoMap from './KakaoMap';
import HLSPlayer from './HLSPlayer';
import ModalBox from './ModalBox';
import SmallPlayer from './SmallPlayer';
import LeftMenu from './LeftMenu';
import LeftSmallVideos from './LeftSmallVideos';
import cctvsOriginal from './sources';
import axios from 'axios';
import cctvImage from './assets/CCTV_Camera.png';
import {setUniqAreasFromSources, orderByArea, groupCCTVsByArea} from './lib/sourceUtil';
import {getPosition, makeMarkerImage, showMarker, showOverlay, movePositionNSetLevel} from './lib/mapUtil';
import FilterCCTV from './FilterCCTV';
import {storage} from './lib/LocalStorage';

import CONSTANTS from './constants';

const cctvs = orderByArea(cctvsOriginal);

const db = storage.open('localStorage');
const LOCAL_STORAGE_KEY = 'SBS_CCTVS_SELECTED';
const savedCCTVIds = db.get(LOCAL_STORAGE_KEY) || [];
console.log(savedCCTVIds)
const cctvIds = cctvs.map(cctv => cctv.cctvId)
const cctvsInDragFrom = cctvIds.filter(cctvId => !(savedCCTVIds.includes(cctvId)) )

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

const INITIAL_COLUMN_DATA = {
  'dragFrom': {
      id: 'dragFrom',
      title: 'Drag From',
      cctvIds:cctvsInDragFrom
  },
  'dropOn': {
      id: 'dropOn',
      title: 'Drop Here',
      cctvIds:savedCCTVIds
  }
}

const INITIAL_COLUMN_ORDER = ['dragFrom', 'dropOn'];

const CCTV_ID_JEJU = 9982;
const isJeju = cctvId => cctvId === CCTV_ID_JEJU;

const ENCRIPTED_URL_PROVIDER = process.env.REACT_APP_ENCRIPTED_URL_PROVIDER;

const getUrlJob = cctvs => {
  return cctvs.map(async cctv => {
            try {
              const {cctvId} = cctv;
              const response = await axios.get(ENCRIPTED_URL_PROVIDER,{params:{cctvId}});
              return {...cctv, url:response.data.url}
            } catch(err){
              return false;
            }
          })
} 

const movePositionNSetLevelById = (cctvs, map, cctvId) => {
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

const mirrorModalPlayer = (playerNode, modalPlayer) => {
  const videoElement =  playerNode.querySelector('video');
  console.log('### videoElement:', videoElement);
  const mediaStream = videoElement.captureStream();
  const modalVideoPlayer = modalPlayer.tech().el();
  modalVideoPlayer.srcObject = null;
  modalVideoPlayer.srcObject = mediaStream;
}

const showCurrentLocation = (currentAreaIndex, setLocationDisplay) => {
    setLocationDisplay(locationDisplay => {
      const newLocationDisplay = [...locationDisplay]
      const ALREADY_SHOWN = newLocationDisplay[currentAreaIndex] === 'block';
      if(ALREADY_SHOWN) return newLocationDisplay;
      newLocationDisplay.fill('none');
      newLocationDisplay[currentAreaIndex] = 'block'
      return newLocationDisplay
  })
}

const clearVideoSrcObject = playerNode => {
  const videoElement = playerNode.querySelector('video');
  videoElement.srcObject = null;
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
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [columnData, setColumnData] = React.useState(INITIAL_COLUMN_DATA);
  const [columnOrder, setColumnOrder] = React.useState(INITIAL_COLUMN_ORDER);
  const [groupByArea, setGroupByArea] = React.useState(true);


  console.log('re-render:', cctvsInAreas)
  const playerRef = React.useRef(null);
  const preLoadMapRef = React.useRef(new Map());
  // const cctvListRef = React.useRef([]);
  const currentTitle = currentId ? cctvs.find(cctv => cctv.cctvId === currentId).title : 'none'

  // get hls urls for individual cctvs
  React.useEffect(() => {
    setLoadingOpen(true);
    Promise.all(getUrlJob(cctvs))
    .then(cctvsWithUrls => {
      setLoadingOpen(false)
      if(cctvsWithUrls.some(url => url === false)){
        alert(`Error getting encrypted Url. check ${ENCRIPTED_URL_PROVIDER}`)
      }
      setUrls(cctvsWithUrls)
    })
  },[])

  // React.useEffect(() => {
  //   const uniqAreas = setUniqAreasFromSources(cctvs, setAreas);
  //   const locationDisplay = new Array(uniqAreas.length);
  //   setLocationDisplay(locationDisplay.fill('none'))
  //   groupCCTVsByArea(uniqAreas, cctvs, setCCTVsInAreas);
  // },[])

  React.useEffect(() => {
    const cctvIdsSelected = columnData['dropOn'].cctvIds;
    // const cctvsSelected = cctvs.filter(cctv => cctvIdsSelected.includes(cctv.cctvId));
    const cctvsSelected = cctvIdsSelected.map(cctvId => cctvs.find(cctv => cctv.cctvId === cctvId));
    const uniqAreas = setUniqAreasFromSources(cctvsSelected, setAreas);
    const locationDisplay = new Array(uniqAreas.length);
    setLocationDisplay(locationDisplay.fill('none'))
    groupCCTVsByArea(uniqAreas, cctvsSelected, setCCTVsInAreas);
  },[columnData])

  React.useEffect(() => {
    if(map === null) return;
    const markerImageSize = new window.kakao.maps.Size(60,50);
    const markerImageOptions = {offset: new window.kakao.maps.Point(27, 50)};
    const markerImage = makeMarkerImage(cctvImage, markerImageSize, markerImageOptions);
    cctvs.forEach(cctv => {
      const targetPosition = getPosition(cctv.lat, cctv.lng);
      const marker = showMarker(map, markerImage, targetPosition);
      window.kakao.maps.event.addListener(marker, 'click', onClickMarker(cctv.cctvId, urls))
    })
    movePositionNSetLevel(map, INI_LAT, INI_LNG, INI_LEVEL)
  },[map, urls])

  const onClickMarker = (cctvId, urls) => {
    return () => {
      setCurrentId(cctvId);
      setPlayerDisplay('none');
      const targetPosition = movePositionNSetLevelById(cctvs, map, cctvId);
      showSmallPlayerById(map, cctvId, urls, targetPosition, playerRef);
      const cctv = cctvs.find(cctv => cctv.cctvId === cctvId);
      const cctvArea = cctv.title.split(' ')[0]
      setCurrentArea(cctvArea);
      cctvSlideOpen(cctvArea);
    }
  }

  const showSmallPlayerById = (map, cctvId, urls, targetPosition, playerRef) => {
    console.log('### urls:', urls)
    const playerNode = playerRef.current;
    const currentOverlay = showOverlay(map, targetPosition, playerNode);
    clearVideoSrcObject(playerNode);
    const cctvWithUrl = urls.find(url => url.cctvId === cctvId )
    // setPlayerSource({url: 'none'})

    console.log('####', cctvWithUrl)
    cctvWithUrl && setTimeout(() => {
      setPlayerSource({url: cctvWithUrl.url});
      setPlayerDisplay('block');
    },1) 
    setCurrentOverlay(currentOverlay);
  }

  const mirrorSmallPlayerById = (map, targetPosition, playerRef, preloadElement) => {
    console.log('mirror preload player!')
    const playerNode = playerRef.current;
    const currentOverlay = showOverlay(map, targetPosition, playerNode);
    setTimeout(() => {
      const preloadVideoElement = preloadElement.querySelector('video');
      const targetVideoElement = playerNode.querySelector('video');
      const preloadMediaStream = preloadVideoElement.captureStream();
      // targetVideoElement.srcObject = null;
      targetVideoElement.srcObject = preloadMediaStream
      setPlayerDisplay('block');
      setCurrentOverlay(currentOverlay);
    },100)
  }

  const onClickCCTVinMenu = React.useCallback(event => {
    console.log('goLocation:', event, typeof(event))
    const cctvId = typeof(event) === 'number' ? event : event.target.id || event.target.parentElement.id;
    const cctvIdNum = parseInt(cctvId);
    const preloadMap = preLoadMapRef.current;
    const preloadElement = preloadMap.get(cctvId);
    setCurrentId(cctvIdNum);
    setPlayerDisplay('none');
    const targetPosition = movePositionNSetLevelById(cctvs, map, cctvIdNum)
    if(!SHOW_ON_MAP) return;
    groupByArea ? 
    showSmallPlayerById(map, cctvIdNum, urls, targetPosition, playerRef) :
    mirrorSmallPlayerById(map, targetPosition, playerRef, preloadElement)

  },[map, urls, groupByArea])

  const maximizeVideo = React.useCallback(event => {
    const playerNode = playerRef.current;
    mirrorModalPlayer(playerNode, modalPlayer);
    setModalOpen(true);
  },[playerRef, modalPlayer])

  const closeVideo = event => {
    currentOverlay !== null && currentOverlay.setMap(null);
    setPlayerDisplay('none');
  }

  const cctvSlideOpen = currentArea => {
    const currentAreaIndex = areas.findIndex(area => area === currentArea);
    showCurrentLocation(currentAreaIndex, setLocationDisplay);
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
    showCurrentLocation(currentAreaIndex, setLocationDisplay);
    setCurrentArea(currentArea);
    const cctvArray = cctvsInAreas.get(currentArea);
    onClickCCTVinMenu(cctvArray[0].cctvId);
  },[areas, cctvsInAreas, onClickCCTVinMenu])

  React.useEffect(()=>{
    if(location === null) return;
    console.log(`lat: ${location.getLat()}, lng: ${location.getLng()}, level: ${level}`);
  },[location, level])

  const setColumnDataNSave = React.useCallback((columnData) => {
    db.set(LOCAL_STORAGE_KEY, columnData['dropOn'].cctvIds);
    setColumnData(columnData);
  },[])

  return (
    // <DragDropContext onDragEnd={onDragEnd}>
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
              onClickCCTVinMenu={onClickCCTVinMenu}
              setFilterOpen={setFilterOpen}
              groupByArea={groupByArea}
            ></LeftMenu>
            {!groupByArea && (
            <LeftSmallVideos
              cctvsInAreas={cctvsInAreas}
              urls={urls}
              preLoadMapRef={preLoadMapRef}
            >
            </LeftSmallVideos>
            )}
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
          <FilterCCTV
            filterOpen={filterOpen}
            cctvs={cctvs}
            setFilterOpen={setFilterOpen}
            columnData={columnData}
            columnOrder={columnOrder}
            // setColumnData={setColumnData}
            setColumnData={setColumnDataNSave}
            groupByArea={groupByArea}
            setGroupByArea={setGroupByArea}
          >
          </FilterCCTV>
        </header>
      </div>
    // </DragDropContext>
  );
}

export default React.memo(App);
