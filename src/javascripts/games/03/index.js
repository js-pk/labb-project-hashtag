import { common } from '../../common';

let isCapturing = false;
let cameraSound = new Howl({src: ['/sound/camera.mp3']});
let popcornSound = new Howl({
  src: ['/sound/popcorn.mp3'],
  loop: true
});

function capture() {
  const canvas = document.createElement('canvas');
  const video = document.querySelector('video');

  canvas.width = video.clientWidth * 2;
  canvas.height = video.clientHeight * 2;

  video.pause();

  const top = window.getComputedStyle(video).getPropertyValue('top');
  canvas.getContext('2d').drawImage(video, 0, parseFloat(top), canvas.width, canvas.height);

  const arImgData = document.querySelector('a-scene').components.screenshot.getCanvas('perspective');
  canvas.getContext('2d').drawImage(arImgData, 0, parseFloat(top), canvas.width, canvas.height);
  // downloadImage(canvas);
  uploadImage(canvas);

  video.play();
}

function downloadImage(canvas) {
  if (window.navigator.msSaveOrOpenBlob) {
    const blob = canvas.msToBlob();
    window.navigator.msSaveOrOpenBlob(blob, 'download.png');
  } else {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'download.png';
    a.click();
  }
}

function uploadImage(canvas) {
  const formData = new FormData();
  popcornSound.loop = true;
  popcornSound.play();
    
  canvas.toBlob(async (b) => {
    try {
      formData.append('image', b, 'filename.png');
      const response = await fetch('/game/upload', {
        method: 'POST',
        body: formData,
      });
      if (response && response.status === 200) {
        setTimeout(() => {
          common.completeStage('03');
        }, 2000)
        
      }
    } catch (error) {
      throw new Error(error);
    } finally {
      isCapturing = false;
    }
  });
}

function handleClick() {
  cameraSound.play();
  if (!isCapturing) {
    isCapturing = true;
    document.getElementById('capture-loading').style.display = 'flex';
    capture();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  
  const sceneEl = document.querySelector('a-scene');
  let arSystem;
  
  sceneEl.addEventListener('loaded', function () {
	  arSystem = sceneEl.systems["mindar-face-system"];
	});
	
	sceneEl.addEventListener('arReady', function () {
	  document.getElementById('capture').addEventListener('click', handleClick);
	  
	 // canvas = document.querySelector('canvas');
	 // arSystem = sceneEl.systems["mindar-face-system"];
	 // console.log(arSystem.video);
	 // console.log(video);
	  if (arSystem.shouldFaceUser) {
	    arSystem.video.className = 'flipped';
	    sceneEl.className = 'flipped';
	  } else {
	    arSystem.video.className = '';
	    sceneEl.className = '';
	  }
	});
	

	const switchCameraButton = document.querySelector("#switch-camera-button");
	switchCameraButton.addEventListener('click', () => {
	  arSystem.switchCamera();
	  if (arSystem.shouldFaceUser) {
	    arSystem.video.className = 'flipped';
	    sceneEl.className = 'flipped';
	  } else {
	    arSystem.video.className = '';
	    sceneEl.className = '';
	  }
	});
	
	
});