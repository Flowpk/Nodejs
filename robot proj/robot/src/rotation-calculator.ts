import { Coord3D, Coords3D } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util";
import { topk } from "@tensorflow/tfjs-core";
import { FaceTracking } from "./face-tracking";
import { Coord3DArrayFilter } from "./one-euro-filter/coords3d-array-filter";

export class RotationCalculator{

    private faceTracking:FaceTracking
    private filter: Coord3DArrayFilter

    constructor(faceTracking: FaceTracking){
        this.faceTracking = faceTracking
        this.filter = new Coord3DArrayFilter( 4 , 30, 0.1 , 0.05)
    }

    public async calculateRotation(){
        const prediction = await this.faceTracking.predict()
        if(prediction){
            let left = (prediction[0].mesh as Coords3D)[454]
            let right = (prediction[0].mesh as Coords3D)[234]
            let bottom = (prediction[0].mesh as Coords3D)[200]
            let top = (prediction[0].mesh as Coords3D)[10]
            const coordsArray = [top, bottom, right, left] as Coords3D
            [top , bottom, right, left ] = this.filter.filter(coordsArray)
            const x = this.calculateXRotation(top,bottom)
            const y = this.calculateYRotation(left,right)
            return [x,y]
        }
    }

    private calculateYRotation(left:Coord3D, right:Coord3D){
        const leftX = left[0]
        const leftY = left[1]
        const leftZ = left[2]
        const rightX = right[0]
        const rightY = right[1]
        const rightZ = right[2]

        const absoluteX = Math.abs(leftX - rightX)
        const absoluteY = Math.abs(leftY - rightY)
        const absoluteZ = Math.abs(leftZ - rightZ)

        const divisionY = absoluteZ / absoluteX

        const yAngleRadians = Math.atan(divisionY)
        const yDegree = (yAngleRadians * (180.0 / Math.PI))
        let yAngle = 0;
        if(leftZ < rightZ){
            yAngle = yDegree
        }
        else{
            yAngle = - yDegree
        }
        return yAngle
    }
    private calculateXRotation(top:Coord3D, bottom:Coord3D){
        const topX = top[0]
        const topY = top[1]
        const topZ = top[2]
        const bottomX = bottom[0]
        const bottomY = bottom[1]
        const bottomZ = bottom[2]

        const absoluteX = Math.abs(topX - bottomX)
        const absoluteY = Math.abs(topY - bottomY)
        const absoluteZ = Math.abs(topZ - bottomZ)

        const divisionX = absoluteY / absoluteZ
        const xAngleRadians = Math.atan(divisionX)
        const xDegree = (xAngleRadians * (180.0 / Math.PI))
        let xAngle = 0;
        if(topZ > bottomZ){
            xAngle = - (90 - xDegree)
        }
        else{
            xAngle = 90 - xDegree
        }
        return xAngle
    }
}