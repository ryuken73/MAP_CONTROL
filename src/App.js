import React from 'react';
import './App.css';
import {Box, Button} from '@material-ui/core';
import Loading from './Loading';
import KakaoMap from './KakaoMap';
import HLSPlayer from './HLSPlayer';
import ModalBox from './ModalBox';
import cctvs from './sources';
import axios from 'axios';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

const INI_LAT = '36.313556278060986';
const INI_LNG = '128.0467344953251';
const INI_LEVEL = 13;
const SHOW_ON_MAP = true;
const ENCRIPTED_URL_PROVIDER = 'http://localhost/encrypted';

const getPosition = (lat, lng) => {
  return new window.kakao.maps.LatLng(lat, lng);
}

const movePositionNSetLevel = (map, lat, lng, level) => {
    const moveLatLng = getPosition(lat, lng);
    const mapLevel = level || 11;
    map.setLevel(mapLevel, {anchor: moveLatLng})
    map.panTo(moveLatLng);
    return moveLatLng;
}

const showMarker = (map, targetPosition) => {
  const marker = new window.kakao.maps.Marker({position: targetPosition});
  marker.setMap(map);
  return marker;
}

const showOverlay = (map, targetPosition, playerNode) => {
  const customOverlay = new window.kakao.maps.CustomOverlay({
    position: targetPosition,
    content: playerNode,
    xAnchor: 0.5,
    yAnchor: 0
  })
  const {
    onMouseDown,
    onMouseUp,
    addEventHandle,
  } = require('./lib/mapOverlayUtil')(map, customOverlay);

  // 커스텀 오버레이에 mousedown이벤트를 등록합니다 
  addEventHandle(playerNode, 'mousedown', onMouseDown);

  // mouseup 이벤트가 일어났을때 mousemove 이벤트를 제거하기 위해
  // document에 mouseup 이벤트를 등록합니다 
  addEventHandle(document, 'mouseup', onMouseUp);

  customOverlay.setMap(map)
}

function App() {
  const [map, setMap] = React.useState(null);
  const [location, setLocation] = React.useState(null);
  const [level, setLevel] = React.useState(null);
  const [player, setPlayer] = React.useState(null);
  const [playerDisplay, setPlayerDisplay] = React.useState('none');
  const [playerSource, setPlayerSource] = React.useState({});
  const [currentId, setCurrentId] = React.useState(null);
  const [urls, setUrls] = React.useState([]);
  const [loadingOpen, setLoadingOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  console.log('re-render:', location)
  const playerRef = React.useRef(null);
  const currentTitle = currentId ? cctvs.find(cctv => cctv.cctvId === currentId).title : 'none'

  React.useEffect(() => {
    setLoadingOpen(true)
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
      setPlayerDisplay('none');
      const targetPosition = movePositionNSetLevelById(map, cctvId);
      showSmallPlayerById(map, cctvId, urls, targetPosition, playerRef);
    }
  }

  React.useEffect(() => {
    if(map === null) return;
    cctvs.forEach(cctv => {
      const targetPosition = getPosition(cctv.lat, cctv.lng);
      const marker = showMarker(map, targetPosition);
      window.kakao.maps.event.addListener(marker, 'click', markerClickHandler(cctv.cctvId, urls))
    })
    movePositionNSetLevel(map, INI_LAT, INI_LNG, INI_LEVEL)
  },[map, urls])

  const movePositionNSetLevelById = (map, cctvId) => {
    const cctv = cctvs.find(cctv => cctv.cctvId === cctvId);
    const targetPosition = movePositionNSetLevel(map, cctv.lat, cctv.lng, cctv.mapLevel);
    return targetPosition;
  }

  const showSmallPlayerById = (map, cctvId, urls, targetPosition, playerRef) => {
    console.log('### urls:', urls)
    const playerNode = playerRef.current;
    showOverlay(map, targetPosition, playerNode);
    const cctvWithUrl = urls.find(url => url.cctvId === cctvId )
    cctvWithUrl && setTimeout(() => {
      setPlayerDisplay('block');
      setPlayerSource({url: cctvWithUrl.url})
    },500)
  }

  const gotoLocation = React.useCallback(event => {
    const cctvId = event.target.id || event.target.parentElement.id;
    const cctvIdNum = parseInt(cctvId);
    setCurrentId(cctvIdNum);
    setPlayerDisplay('none');
    const targetPosition = movePositionNSetLevelById(map, cctvIdNum)
    if(!SHOW_ON_MAP) return;
    console.log('### urls:', urls)
    showSmallPlayerById(map, cctvIdNum, urls, targetPosition, playerRef)
  },[map, urls])

  const maximizeVideo = event => {
    setModalOpen(true)
  }

  return (
    <div className="App">
      <header className="App-header">
        <Box display="flex" flexDirection="row" fontSize="15px">
          <Box>
            lat:{location ? location.getLat():0}
          </Box>
          <Box ml="20px">
            lng:{location ? location.getLng():0}
          </Box>
          <Box ml="20px">
            level:{level ? level:"null"}
          </Box>
        </Box>
        <div ref={playerRef} style={{display: playerDisplay, padding:"3px", borderColor:"black", border:"solid 1px black", background:'white'}}>
          <Box display="flex" p="5px" color="white" fontSize="18px" bgcolor="black">
            <Box m="auto" width="100%">
              {currentTitle}
            </Box>
            <Box ml="auto">
              <FullscreenIcon
                fontSize="default"
                style={{color:"grey"}}
                onClick={maximizeVideo}
              ></FullscreenIcon>
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
          ></KakaoMap>
        </Box>
        <Box display="flex" flexDirection="row" fontSize="15px" flexWrap="wrap">
          {cctvs.map(cctv => (
            <Box ml="10px" mt="10px">
              <Button key={cctv.cctvId} id={cctv.cctvId} variant="contained" color="primary" onClick={gotoLocation}>
                {cctv.title} 
              </Button>
            </Box>

          ))}
        </Box>
        <ModalBox open={modalOpen} setOpen={setModalOpen} contentWidth="80%" contentHeight="80%">
            <HLSPlayer 
              // fluid={true}
              fill={true}
              responsive={true}
              source={playerSource}
              setPlayer={setPlayer}
            ></HLSPlayer>
        </ModalBox>
        <Loading open={loadingOpen} setOpen={setLoadingOpen}></Loading>
      </header>
    </div>
  );
}

export default App;
