import React from 'react';
import './App.css';
import {Box, Button} from '@material-ui/core';
import videojs from 'video.js';
import KakaoMap from './KakaoMap';
import OverlayContent from './OverlayContent';
import HLSPlayer from './HLSPlayer';
import ModalBox from './ModalBox';
import cctvs from './sources';

const SHOW_ON_MAP = false;

function App() {
  const [map, setMap] = React.useState(null);
  const [location, setLocation] = React.useState(null);
  const [level, setLevel] = React.useState(null);
  const [players, setPlayers] = React.useState(new Map());
  const [player, setPlayer] = React.useState(null);
  const [playerDisplay, setPlayerDisplay] = React.useState('none');
  const [playerSource, setPlayerSource] = React.useState({});
  console.log('re-render:', location)
  const playerRef = React.useRef(null);


  React.useEffect(() => {
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

  const gotoLocation = cctvId => {
    return event => {
      setPlayerDisplay('none');
      const cctv = cctvs.find(cctv => cctv.cctvId === cctvId);
      const moveLatLng = new window.kakao.maps.LatLng(cctv.lat, cctv.lng);
      map.panTo(moveLatLng);
      if(SHOW_ON_MAP){
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: moveLatLng,
          // content: players.get(cctv.cctvId)
          content: playerRef.current 
        })
        customOverlay.setMap(map)
        setTimeout(() => {
          setPlayerDisplay('block');
        }, 1000)
      }

    }
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
        <div ref={playerRef} style={{display: playerDisplay}}>
          <HLSPlayer 
            width={350}
            height={250}
            source={playerSource}
            setPlayer={setPlayer}
          ></HLSPlayer>
        </div>
        <Box width="99%" height="100%">
          <KakaoMap
            setMap={setMap}
            setLocation={setLocation}
            setLevel={setLevel}
          ></KakaoMap>
        </Box>
        <Box display="flex" flexDirection="row" fontSize="15px" flexWrap="wrap">
          {cctvs.map(cctv => (
            <Box ml="10px" mt="10px">
              <Button id={cctv.cctvId} variant="contained" color="primary" onClick={gotoLocation(cctv.cctvId)}>
                {cctv.title} 
              </Button>
            </Box>

          ))}
        </Box>
        <ModalBox>
          <HLSPlayer 
              width={640}
              height={320}
              source={playerSource}
              setPlayer={setPlayer}
           ></HLSPlayer>
        </ModalBox>

      </header>
    </div>
  );
}

export default App;
