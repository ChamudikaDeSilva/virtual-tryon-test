import { useEffect, useRef, useState } from 'react';

export function usePoseDetection(imageUrl: string | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [keypoints, setKeypoints] = useState<any[]>([]);

  useEffect(() => {
    if (!imageUrl) return;

    let pose: any;
    let active = true;

    const run = async () => {
      const mpPoseModule = await import('@mediapipe/pose');
      const mpDraw = await import('@mediapipe/drawing_utils');

      const { Pose, POSE_CONNECTIONS } = mpPoseModule;
      const { drawConnectors, drawLandmarks } = mpDraw;

      pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        if (!active) return;
        setKeypoints(results.poseLandmarks || []);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const landmarks = results.poseLandmarks;
          if (landmarks) {
            drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
              color: '#FF0000',
              lineWidth: 2,
            });
            drawLandmarks(ctx, landmarks, {
              color: '#FF0000',
              lineWidth: 2,
            });

            // Draw T-shirt
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const scaleX = canvas.width;
    const scaleY = canvas.height;

    // Get actual pixel positions
    const leftShoulderX = leftShoulder.x * scaleX;
    const rightShoulderX = rightShoulder.x * scaleX;
    const leftShoulderY = leftShoulder.y * scaleY;
    const rightShoulderY = rightShoulder.y * scaleY;

    const leftHipX = leftHip.x * scaleX;
    const rightHipX = rightHip.x * scaleX;
    const leftHipY = leftHip.y * scaleY;
    const rightHipY = rightHip.y * scaleY;

    const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);
    const torsoHeight = Math.abs(((rightHipY + leftHipY) / 2) - ((leftShoulderY + rightShoulderY) / 2));

    // Add scaling factors and fallback size
    const shirtWidth = Math.max(shoulderWidth * 1.8, canvas.width * 0.3);
    const shirtHeight = Math.max(torsoHeight * 2.0, canvas.height * 0.4);

    // Apply slight upward offset (optional tweak)
    const offsetY = -shirtHeight * 0.15;

    const shirtX = ((leftShoulderX + rightShoulderX) / 2) - shirtWidth / 2;
    const shirtY = ((leftShoulderY + rightShoulderY) / 2) + offsetY;


    const tshirtImg = new Image();
    tshirtImg.src = '/tshirt.png';

    tshirtImg.onload = () => {
        ctx.drawImage(tshirtImg, shirtX, shirtY, shirtWidth, shirtHeight);
    };
    }

          }
        };
      });

      // Load and process image
      const imgBlob = await fetch(imageUrl).then((res) => res.blob());
      const imgBitmap = await createImageBitmap(imgBlob);
      await pose.send({ image: imgBitmap });
    };

    run();

    return () => {
      active = false;
      if (pose?.close) pose.close();
    };
  }, [imageUrl]);

  return { canvasRef, keypoints };
}
