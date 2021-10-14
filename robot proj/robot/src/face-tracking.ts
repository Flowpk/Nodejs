import * as faceLandmarksDetection from'@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs-backend-webgl'
import { MediaPipeFaceMesh } from '@tensorflow-models/face-landmarks-detection/dist/types'
import { Camera } from './camera-utils'
import * as tf from '@tensorflow/tfjs-core'

export class FaceTracking{

    private video: HTMLVideoElement
    private canvas: HTMLCanvasElement
    private model?: MediaPipeFaceMesh;
    private camera?:Camera
    constructor(video:HTMLVideoElement, canvas:HTMLCanvasElement){
        this.video = video
        this.canvas = canvas
    }

    public async init(){
        await tf.setBackend('webgl');
        this.camera = await Camera.setupCamera(this.video, this.canvas,()=>{})
        this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, 
            {maxFaces:1, shouldLoadIrisModel: true})
    }

    public async predict(){
        if(this.model && this.camera){
            const predictions = await this.model.estimateFaces({
                input: this.camera.video
              });
            if (predictions.length > 0) {
                return predictions
            }
        }
    }
}