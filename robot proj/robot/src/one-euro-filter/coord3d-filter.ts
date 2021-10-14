import { Coord3D } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util'
import { Vector3 } from 'three'
import OneEuroFilter from './one-euro-filter'

export class Coord3DFilter {
    private xFilter: OneEuroFilter
    private yFilter: OneEuroFilter
    private zFilter: OneEuroFilter

    constructor (freq: number, minCutOff = 1.0, beta = 0.0, dCutOff = 1.0) {
      this.xFilter = new OneEuroFilter(freq, minCutOff, beta, dCutOff)
      this.yFilter = new OneEuroFilter(freq, minCutOff, beta, dCutOff)
      this.zFilter = new OneEuroFilter(freq, minCutOff, beta, dCutOff)
    }

    public filter (vector3: Coord3D, timestamp: number | null = null): Coord3D {
      const x = this.xFilter.filter(vector3[0], timestamp)
      const y = this.yFilter.filter(vector3[1], timestamp)
      const z = this.zFilter.filter(vector3[2], timestamp)
      return [x,y,z]
    }
}
