import { Coords3D } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util';
import { Vector3 } from 'three'
import { Coord3DFilter } from './coord3d-filter'

export class Coord3DArrayFilter {
    private filters: Array<Coord3DFilter>;

    constructor (numberOfFilters: number, freq: number, minCutOff = 1.0, beta = 0.0, dCutOff = 1.0) {
      this.filters = new Array<Coord3DFilter>(numberOfFilters)
      for (let i = 0; i < this.filters.length; i++) {
        this.filters[i] = new Coord3DFilter(freq, minCutOff, beta, dCutOff)
      }
    }

    public filter (coords: Coords3D, timestamp: number | null = null): Coords3D {
      return coords.map((value, index) => this.filters[index].filter(value, timestamp))
    }
}
