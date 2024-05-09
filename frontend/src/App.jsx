import { useRef } from 'react'
import './App.css'

import VideoPlayer from './VideoPlayer'

function App() {
  const playerRef = useRef(null);
  const videoLink = "http://localhost:4000/uploads/lession/2d1c5a25-817d-456d-bb93-66c07d037d64/index.m3u8";

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: videoLink,
      type: 'application/x-mpegURL'
    }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      // videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      // videojs.log('player will dispose');
    });
  };

  return (
    <>
      <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
    </>
  )
}

export default App
