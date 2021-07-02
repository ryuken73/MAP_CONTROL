module.exports = (map, customoverlay) => {
    let startX, startY, startOverlayPoint;
    const onMouseDown = e => {
        // 커스텀 오버레이를 드래그 할 때, 내부 텍스트가 영역 선택되는 현상을 막아줍니다.
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    
        const proj = map.getProjection(); // 지도 객체로 부터 화면픽셀좌표, 지도좌표간 변환을 위한 MapProjection 객체를 얻어옵니다 
        const overlayPos = customoverlay.getPosition(); // 커스텀 오버레이의 현재 위치를 가져옵니다
    
        // 커스텀오버레이에서 마우스 관련 이벤트가 발생해도 지도가 움직이지 않도록 합니다
        window.kakao.maps.event.preventMap();
    
        // mousedown된 좌표를 설정합니다 
        startX = e.clientX; 
        startY = e.clientY;
    
        // mousedown됐을 때의 커스텀 오버레이의 좌표를
        // 지도 컨테이너내 픽셀 좌표로 변환합니다 
        startOverlayPoint = proj.containerPointFromCoords(overlayPos);
    
        // document에 mousemove 이벤트를 등록합니다 
        addEventHandle(document, 'mousemove', onMouseMove);       
    }
    
    // 커스텀 오버레이에 mousedown 한 상태에서 
    // mousemove 하면 호출되는 핸들러 입니다 
    const onMouseMove = e => {
        // 커스텀 오버레이를 드래그 할 때, 내부 텍스트가 영역 선택되는 현상을 막아줍니다.
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    
        var proj = map.getProjection(),// 지도 객체로 부터 화면픽셀좌표, 지도좌표간 변환을 위한 MapProjection 객체를 얻어옵니다 
            deltaX = startX - e.clientX, // mousedown한 픽셀좌표에서 mousemove한 좌표를 빼서 실제로 마우스가 이동된 픽셀좌표를 구합니다 
            deltaY = startY - e.clientY,
            // mousedown됐을 때의 커스텀 오버레이의 좌표에 실제로 마우스가 이동된 픽셀좌표를 반영합니다 
            newPoint = new window.kakao.maps.Point(startOverlayPoint.x - deltaX, startOverlayPoint.y - deltaY), 
            // 계산된 픽셀 좌표를 지도 컨테이너에 해당하는 지도 좌표로 변경합니다 
            newPos = proj.coordsFromContainerPoint(newPoint);
    
        // 커스텀 오버레이의 좌표를 설정합니다 
        customoverlay.setPosition(newPos);
    }
    
    // mouseup 했을 때 호출되는 핸들러 입니다 
    const onMouseUp = e => {
        // 등록된 mousemove 이벤트 핸들러를 제거합니다 
        removeEventHandle(document, 'mousemove', onMouseMove);
    }
    
    // target node에 이벤트 핸들러를 등록하는 함수힙니다  
    const addEventHandle = (target, type, callback) => {
        if (target.addEventListener) {
            target.addEventListener(type, callback);
        } else {
            target.attachEvent('on' + type, callback);
        }
    }
    
    // target node에 등록된 이벤트 핸들러를 제거하는 함수힙니다 
    const removeEventHandle = (target, type, callback) => {
        if (target.removeEventListener) {
            target.removeEventListener(type, callback);
        } else {
            target.detachEvent('on' + type, callback);
        }
    }


    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        addEventHandle
    }
}