import React from 'react';

const options = {
    center: new window.kakao.maps.LatLng(33.450701, 126.570667),
    level: 3,
    mapTypeId : window.kakao.maps.MapTypeId.ROADMAP
}

function KakaoMap(props) {
    const {setMap, setLocation, setLevel, maxLevel=13} = props;
    const container = React.useRef(null);
    React.useEffect(() => {
        const map = new window.kakao.maps.Map(container.current, options);
        map.setMaxLevel(13)
        setMap(map);
        window.kakao.maps.event.addListener(map, 'click', function(mouseEvent) {  
            const latLng = mouseEvent.latLng;
            const level = map.getLevel();
            console.log(level)
            setLocation(latLng)
            setLevel(level)
          })
        return () => {}
    },[])
    return (
        <div
            className="map"
            style={{width:"100%", height:"100%"}}
            ref={container}
        >
        </div>
    )
}

export default React.memo(KakaoMap)