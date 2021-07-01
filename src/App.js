import React from 'react';
import './App.css';
import {Box, Button} from '@material-ui/core';
import videojs from 'video.js';
import KakaoMap from './KakaoMap';
import OverlayContent from './OverlayContent';
import HLSPlayer from './HLSPlayer';
import ModalBox from './ModalBox';
import cctvs from './sources';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';

const SHOW_ON_MAP = true;

function App() {
  const [map, setMap] = React.useState(null);
  const [location, setLocation] = React.useState(null);
  const [level, setLevel] = React.useState(null);
  const [players, setPlayers] = React.useState(new Map());
  const [player, setPlayer] = React.useState(null);
  const [playerDisplay, setPlayerDisplay] = React.useState('block');
  const [playerSource, setPlayerSource] = React.useState({});
  const [currentId, setCurrentId] = React.useState(null);
  const [urls, setUrls] = React.useState([]);

  console.log('re-render:', location)
  const playerRef = React.useRef(null);
  const currentTitle = currentId ? cctvs.find(cctv => cctv.cctvId === currentId).title : 'none'

  React.useEffect(() => {
    const getUrlJob = cctvs.map(async cctv => {
      const {cctvId} = cctv;
      const response = await axios.get('http://localhost/encrypted',{params:{cctvId}});
      return {...cctv, url:response.data.url}
    })

    Promise.all(getUrlJob)
    .then(cctvsWithUrls => {
      setUrls(cctvsWithUrls)

    })

    // cctvs.forEach(cctv => {
    //   const divElement = document.createElement('video');
    //   divElement.id = cctv.cctvId;
    //   divElement.className = 'video-js';
    //   setPlayers(players => {
    //     players.set(cctv.cctvId, divElement);
    //     return new Map(players)
    //   })
      // const playersDiv = document.getElementById('players');
      // playersDiv.appendChild(divElement);

      // const player = videojs(divElement, {}
        // { sources : 
        //   [ { src : "test.mp4", type : "video/mp4"} ], 
        //   poster : "test-poster.png", 
        //   controls : true, 
        //   playsinline : true, 
        //   muted : true, 
        //   preload : "metadata", 
        // }
      // );
    // })
  },[])

  const gotoLocation = React.useCallback(event => {
    const cctvId = event.target.id || event.target.parentElement.id;
    const cctvIdNum = parseInt(cctvId);
    setCurrentId(cctvIdNum);
    setPlayerDisplay('block');
    const cctv = cctvs.find(cctv => cctv.cctvId === cctvIdNum);
    const cctvWithUrl = urls.find(url => url.cctvId === cctvIdNum )
    console.log('####################',cctvWithUrl)

    const moveLatLng = new window.kakao.maps.LatLng(cctv.lat, cctv.lng);
    const mapLevel = cctv.mapLevel || 11;
    map.setLevel(mapLevel, {anchor: moveLatLng})
    map.panTo(moveLatLng);
    const marker = new window.kakao.maps.Marker({position: moveLatLng});
    marker.setMap(map)

    if(SHOW_ON_MAP){
      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: moveLatLng,
        // content: players.get(cctv.cctvId)
        content: playerRef.current,
        xAnchor: 0.5,
        yAnchor: 0
      })
      customOverlay.setMap(map)
      setPlayerSource({url: cctvWithUrl.url})
      setTimeout(() => {
        console.log('change display to block')
        setPlayerDisplay('block');
      },500)
    }
  },[urls])

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
        <div ref={playerRef} style={{display: playerDisplay, padding:"3px", "border-color":"black", border:"solid 1px", background:'white'}}>
          <Box p="5px" color="white" fontSize="18px" bgcolor="black">
            {currentTitle}
          </Box>
          <HLSPlayer 
            width={350}
            height={200}
            fluid={false}
            source={playerSource}
            setPlayer={setPlayer}
          ></HLSPlayer>
        </div>
        <Box width="99%" height="600px">
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
          <ModalBox contentWidth="80%">
              <HLSPlayer 
                fluid={true}
                responsive={true}
                source={playerSource}
                setPlayer={setPlayer}
                aspectRatio={'2:1'}
              ></HLSPlayer>
          </ModalBox>
      </header>
      {/* <HLSPlayer 
          source={playerSource}
          setPlayer={setPlayer}
      ></HLSPlayer> */}
    </div>
  );
}

export default App;
