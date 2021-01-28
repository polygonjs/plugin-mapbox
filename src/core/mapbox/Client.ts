import {IntegrationData} from '@polygonjs/polygonjs/dist/src/engine/nodes/_Base';
import {Poly} from '@polygonjs/polygonjs/dist/src/engine/Poly';
import {PolyPluginMapbox} from '../../PolyPluginMapbox';
export class CoreMapboxClient {
	static CSS_URL = 'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css';
	static _token: string;

	static token() {
		const plugin = Poly.pluginsRegister.pluginByName('mapbox') as PolyPluginMapbox;
		const token = plugin.token();
		return token;
	}

	static integration_data(): IntegrationData | void {
		const token = this.token();
		if (token) {
			return {
				name: 'mapbox',
				data: {token},
			};
		}
	}
}
