import React from 'react';
import './App.css';
import {Box, Button} from '@material-ui/core';
import videojs from 'video.js';
import KakaoMap from './KakaoMap';
import OverlayContent from './OverlayContent';
import HLSPlayer from './HLSPlayer';
import cctvs from './sources';

const CCTV_HOST = 'http://61.96.224.149';

function App() {
  const [map, setMap] = React.useState(null);
  const [location, setLocation] = React.useState(null);
  const [level, setLevel] = React.useState(null);
  const [players, setPlayers] = React.useState(new Map());
  const [player, setPlayer] = React.useState(null);
  const [playerSource, setPlayerSource] = React.useState({});
  console.log('re-render:', location)

  React.useEffect(() => {
    cctvs.forEach(cctv => {
      const divElement = document.createElement('video');
      divElement.id = cctv.cctvId;
      divElement.className = 'video-js';
      setPlayers(players => {
        players.set(cctv.cctvId, divElement);
        return new Map(players)
      })
      const playersDiv = document.getElementById('players');
      playersDiv.appendChild(divElement);

      const player = videojs(divElement, {}
        // { sources : 
        //   [ { src : "test.mp4", type : "video/mp4"} ], 
        //   poster : "test-poster.png", 
        //   controls : true, 
        //   playsinline : true, 
        //   muted : true, 
        //   preload : "metadata", 
        // }
      );
    })
  },[])

  const gotoLocation = cctvId => {
    return event => {
      const cctv = cctvs.find(cctv => cctv.cctvId === cctvId);
      const moveLatLng = new window.kakao.maps.LatLng(cctv.lat, cctv.lng);
      // map.setLevel(8, {
      //   animate: {
      //     duration: 300
      //   }
      // });
      map.panTo(moveLatLng);
      // map.setLevel(6, {
      //   animate: {
      //     duration: 500
      //   }
      // })
      console.log(players.get(cctv.cctvId))
      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: moveLatLng,
        content: players.get(cctv.cctvId)
      })
      customOverlay.setMap(map)
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
        <HLSPlayer 
          source={playerSource}
          setPlayer={setPlayer}
        ></HLSPlayer>

        <Box width="80%" height="500px">
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


      </header>
    </div>
  );
}

export default App;
