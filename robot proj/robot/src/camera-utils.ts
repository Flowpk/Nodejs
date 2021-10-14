export function isiOS (): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isAndroid (): boolean {
  return /Android/i.test(navigator.userAgent)
}

export function isMobile (): boolean {
  return isAndroid() || isiOS()
}


export class Camera {
  public video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor (video: HTMLVideoElement, outputCanvas: HTMLCanvasElement) {
    this.video = video
    this.canvas = outputCanvas
    this.ctx = this.canvas.getContext('2d')
  }

  static async setupCamera (
    video: HTMLVideoElement,
    outputCanvas: HTMLCanvasElement,
    OnError: (error: string) => void
  ) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }

    const size = {
      width: 693.3333333333333,
      height: 390
    }

    const videoConstraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: 'user',
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: { exact: size.width },
        height: { exact: size.height },

        frameRate: {
          ideal: 25
        }
      }
    }

    let stream: MediaStream | null = null

    try {
      stream = await navigator.mediaDevices.getUserMedia(videoConstraints)
    } catch (err) {
      if (err instanceof DOMException) {
        OnError(err.name)
        if (err.name === 'NotAllowedError') {
          console.log(err.name)
        } else if (err.name === 'NotFoundError') {
          console.log(err.name)
        } else {
          console.log(err)
        }
      }
    }

    const camera = new Camera(video, outputCanvas)
    camera.video.srcObject = stream

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(video)
      }
    })

    const videoWidth = camera.video.videoWidth
    const videoHeight = camera.video.videoHeight
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth
    camera.video.height = videoHeight

    // camera.canvas.width = videoWidth
    // camera.canvas.height = videoHeight

    return camera
  }

  drawCtx () {
    this.ctx?.drawImage(
      this.video,
      0,
      0,
      this.video.videoWidth,
      this.video.videoHeight
    )
  }

  clearCtx () {
    this.ctx?.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight)
  }
}
