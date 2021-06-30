import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import VideoPlayer from './VideoPlayer';

const HLSPlayer = (props) => {
    console.log('rerender hlsplayer', props.player, process.versions)
    const {
        player=null, 
        enableAutoRefresh=null, 
        enableOverlay=true,
        overlayContent='Default Overlay Content',
        overlayRightBtn='Default Right Button',
        overlayLeftBtn='Default left Button',
        startSecondsOffset=0,
        fluid=false,
        responsive=false,
        aspectRatio='2:1'
    } = props;
    console.log('###### source in HLSPlayer:', startSecondsOffset)

    const {
        width="100%",
        height=0,
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        source={},
        type='application/x-mpegURL',
        LONG_BUFFERING_MS_SECONDS=3000
    } = props;
    const {activeSource} = props;
    const {setPlayer} = props;

    const srcObject = {
        src: source.url,
        type,
        handleManifestRedirects: true,
    }

    // make util...

    React.useEffect(() => {
        console.log('playbackRate: ', activeSource, source.url);
    },[])

    const channelLog = console;
    const onPlayerReady = player => {
        channelLog.info("Player is ready");
        setPlayer(player);
        player.muted(true);
    }

    const onVideoPlay = React.useCallback(duration => {
        // channelLog.info("Video played at: ", duration);
    },[]);

    const onVideoPause = React.useCallback(duration =>{
        // channelLog.info("Video paused at: ", duration);
    },[]);

    const onVideoTimeUpdate =  React.useCallback(duration => {
        // channelLog.info("Time updated: ", duration);
    },[]);

    const onVideoSeeking =  React.useCallback(duration => {
        // channelLog.info("Video seeking: ", duration);
    },[]);

    const onVideoSeeked =  React.useCallback((from, to) => {
        channelLog.info(`Video seeked from ${from} to ${to}`);
        // setPlayerSeeked({channelNumber, seeked:to})
    },[])

    const onVideoError = React.useCallback((error) => {

        channelLog.error(`error occurred: ${error && error.message}`);
        if(source.url === '') return;
        // enableAutoRefresh()
    },[])

    const onVideoEnd = React.useCallback(() => {
        // channelLog.info("Video ended");
    },[])

    const onVideoCanPlay = React.useCallback(player => {
        channelLog.info(`can play : `);
        // console.log('can play isTracking(): ',player.liveTracker.isLive())
        // if(restorePlaybackRate && player){
        //     const playbackRate = getPlaybackRateStore();
        //     player.playbackRate(playbackRate);
        // }
        // setPlaybackRate(player)
        // if(activeSource === 'live') player.playbackRate(1);
    },[]);

    let refreshTimer = null;

    const isValidStopDuration = duration => {
        return typeof(duration) === 'number' && duration !== 0 && duration !== Infinity;
    }

    const onLoadStart = player => {
        player.one('durationchange', () => {
            const duration = player.duration();
            let realDuration;
            if(isValidStopDuration(duration)){
                realDuration = duration;
            } else {
                realDuration = 0;
            }
        })
    }

    const onVideoOtherEvent = (eventName, player) => {
        console.log(`event occurred: ${eventName}`)
        // channelLog.debug(`event occurred: ${eventName}`)
        // if(eventName === 'durationchange'){

        //     setRecorderStartTimeSeconds({channelNumber, startTimeSeconds:0});
        //     const duration = player.duration();
        //     let realDuration;
        //     if(isValidStopDuration(duration)){
        //         realDuration = duration;
        //     } else {
        //         realDuration = 0;
        //     }
        //     setClipLengthSeconds({channelNumber, clipLengthSeconds: realDuration})
        //     setRecorderStopTimeSeconds({channelNumber, stopTimeSeconds:realDuration}) 
        // }
        if(eventName === 'abort' && enableAutoRefresh !== null){
            refreshTimer = setInterval(() => {
                channelLog.info('refresh player because of long buffering')
            },LONG_BUFFERING_MS_SECONDS)
            return
        } else if(eventName === 'abort' && enableAutoRefresh === null) {
            // channelLog.debug('abort but not start refresh timer because enableAutoRefresh parameter is null');
            return
        }
        if(eventName === 'playing' || eventName === 'loadstart' || eventName === 'waiting'){
            if(refreshTimer === null) {
                // channelLog.debug('playing, loadstart or waiting event emitted. but do not clearTimeout(refreshTimer) because refreshTimer is null. exit')
                return;
            }
            // channelLog.debug('clear refresh timer.')
            refreshTimer = null;
            return
        }
        if(eventName === 'ratechange'){
            // if ratechange occurred not manually but by changing media, just return
            if(player.readyState() === 0) return;
        }
    }

    return (
        <Box overflow="hidden">
            <VideoPlayer
                controls={controls}
                src={srcObject}
                // poster={this.state.video.poster}
                autoplay={autoplay}
                bigPlayButton={bigPlayButton}
                bigPlayButtonCentered={bigPlayButtonCentered}
                width={width}
                height={height}
                onCanPlay={onVideoCanPlay}
                onReady={onPlayerReady}
                onLoadStart={onLoadStart}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onTimeUpdate={onVideoTimeUpdate}
                onSeeking={onVideoSeeking}
                onSeeked={onVideoSeeked}
                onError={onVideoError}
                onEnd={onVideoEnd}
                onOtherEvent={onVideoOtherEvent}
                handleManifestRedirects={true}
                liveui={true}
                enableOverlay={enableOverlay}
                overlayContent={overlayContent}
                overlayRightBtn={overlayRightBtn}
                overlayLeftBtn={overlayLeftBtn}
                startSecondsOffset={startSecondsOffset}
                inactivityTimeout={0}
                hideControls={['volume', 'timer']}
                fluid={fluid}
                responsive={responsive}
                aspectRatio={aspectRatio}
            />
        </Box>
    );
};

export default React.memo(HLSPlayer);
// export default HLSPlayer