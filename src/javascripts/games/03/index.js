import { common } from '../../common';

let isCapturing = false;

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

  canvas.toBlob(async (b) => {
    try {
      formData.append('image', b, 'filename.png');
      const response = await fetch('/game/upload', {
        method: 'POST',
        body: formData,
      });
      if (response && response.status === 200) {
        console.log('image uploaded!');
        common.completeStage('03');
      }
    } catch (error) {
      throw new Error(error);
    } finally {
      isCapturing = false;
    }
  });
}

function handleClick() {
  if (!isCapturing) {
    isCapturing = true;
    document.getElementById('capture-loading').style.display = 'flex';
    capture();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('capture').addEventListener('click', handleClick);
});
