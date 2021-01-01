import {PolyPlugin} from 'polygonjs-engine/src/engine/poly/registers/plugins/Plugin';

import mapboxgl from 'mapbox-gl';
export class PolyPluginMapbox extends PolyPlugin {
	private _token: string | undefined;
	setToken(token: string) {
		this._token = token;
		mapboxgl.accessToken = this._token;
	}
	token() {
		return this._token;
	}
}
