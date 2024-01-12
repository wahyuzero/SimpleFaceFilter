// inspired by https://github.com/LintangWisesa/MediaPipe-in-JavaScript
const video2 = document.getElementsByClassName('input_video2')[0];
const out2 = document.getElementsByClassName('output2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];
const canvasCtx = out2.getContext('2d');

const fpsControl = new FPS();
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function applyBeautyFilter(canvasCtx, landmarks, component, options) {
  const { blurRadius, brightnessFactor, contrastFactor } = options;
  canvasCtx.filter = `blur(${blurRadius}px)`;
  canvasCtx.filter += `brightness(${brightnessFactor}) contrast(${contrastFactor})`;
  drawConnectors(canvasCtx, landmarks, component, options);
  canvasCtx.filter = 'none';
}

function onResultsFaceMesh(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, out2.width, out2.height);
  canvasCtx.drawImage(results.image, 0, 0, out2.width, out2.height);

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      applyBeautyFilter(canvasCtx, landmarks, FACEMESH_TESSELATION, {
        blurRadius: 20,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(192,192,192,0.5)',
        lineWidth: 4
      });
      applyBeautyFilter(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        blurRadius: 15,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(179, 11, 176,0.6)'
      });
      applyBeautyFilter(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW,{
        blurRadius: 10,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(15, 14, 14,0.4)'
    });
      applyBeautyFilter(canvasCtx, landmarks, FACEMESH_LEFT_EYE,{
        blurRadius: 15,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(179, 11, 176,0.6)'
  });
     applyBeautyFilter(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW,{
        blurRadius: 10,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(15, 14, 14,0.4)'
  });
      applyBeautyFilter(canvasCtx, landmarks, FACEMESH_FACE_OVAL,{
        blurRadius: 10,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(224,224,224,0.1)'
    });
      applyBeautyFilter(canvasCtx, landmarks, FACEMESH_LIPS,{
        blurRadius: 13,
        brightnessFactor: 1,
        contrastFactor: 1.2,
        color: 'rgba(242, 10, 130,0.3)'
  });
  // Reset the filter for subsequent drawings
  canvasCtx.filter = 'none';
}
  }
}
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  },
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({ image: video2 });
  },
  width: 480,
  height: 480,
});
camera.start();

new ControlPanel(controlsElement2, {
  selfieMode: true,
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
})
  .add([
    new StaticText({ title: 'MediaPipe Face Mesh' }),
    fpsControl,
    new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new Slider({
      title: 'Max Number of Faces',
      field: 'maxNumFaces',
      range: [1, 4],
      step: 1,
    }),
    new Slider({
      title: 'Min Detection Confidence',
      field: 'minDetectionConfidence',
      range: [0, 1],
      step: 0.01,
    }),
    new Slider({
      title: 'Min Tracking Confidence',
      field: 'minTrackingConfidence',
      range: [0, 1],
      step: 0.01,
    }),
  ])
  .on((options) => {
    video2.classList.toggle('selfie', options.selfieMode);
    faceMesh.setOptions(options);
  });