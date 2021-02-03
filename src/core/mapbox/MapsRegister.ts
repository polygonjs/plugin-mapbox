import mapboxgl from 'mapbox-gl';

export class MapsRegister {
	private static _instance: MapsRegister;
	static instance() {
		return (this._instance = this._instance || new MapsRegister());
	}
	_maps_by_id: Map<string, mapboxgl.Map> = new Map();

	registerMap(id: string, map: mapboxgl.Map) {
		this._maps_by_id.set(id, map);
	}
	deregisterMap(id: string) {
		this._maps_by_id.delete(id);
	}
}
