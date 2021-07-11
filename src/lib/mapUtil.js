module.exports = () => {
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

    const makeMarkerImage = (image, size, options) => {
        const markerImage = new window.kakao.maps.MarkerImage(image, size, options);
        return markerImage
    }
    
    const showMarker = (map, markerImage, targetPosition) => {
        // console.log(`showMarker:`, map, markerImage, targetPosition)
        const marker = new window.kakao.maps.Marker({position: targetPosition, image:markerImage});
        marker.setMap(map);
        return marker;
    }
    
    const showOverlay = (map, targetPosition, playerNode) => {
        const customOverlay = new window.kakao.maps.CustomOverlay({
            position: targetPosition,
            content: playerNode,
            xAnchor: 0,
            yAnchor: 0
        })
        const {
            onMouseDown,
            onMouseUp,
            addEventHandle,
        } = require('./mapOverlayUtil')(map, customOverlay);
        
        // 커스텀 오버레이에 mousedown이벤트를 등록합니다 
        addEventHandle(playerNode, 'mousedown', onMouseDown);
        
        // mouseup 이벤트가 일어났을때 mousemove 이벤트를 제거하기 위해
        // document에 mouseup 이벤트를 등록합니다 
        addEventHandle(document, 'mouseup', onMouseUp);
        customOverlay.setMap(map)
        return customOverlay
    }
    return {
        getPosition,
        movePositionNSetLevel,
        makeMarkerImage,
        showMarker,
        showOverlay
    }
}