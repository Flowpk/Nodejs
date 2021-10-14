export class Micro {
  
    constructor (video: HTMLVideoElement, outputCanvas: HTMLCanvasElement) {
      
    }
  
    static async setupMicro (
      OnError: (error: string) => void
    ) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Browser API navigator.mediaDevices.getUserMedia not available'
        )
      }
  
      const videoConstraints: MediaStreamConstraints = {
        audio: true,
        video: false
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
            console.log(err.name)
          }
        }
      }
  
      return stream
    }
  }
  