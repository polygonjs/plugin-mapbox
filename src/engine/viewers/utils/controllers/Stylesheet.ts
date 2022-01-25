// let component;
import {CoreMapboxClient} from '../../../../core/mapbox/Client';
import {CoreStylesheetLoader} from '@polygonjs/polygonjs/dist/src/core/loader/Stylesheet';

export class MapboxViewerStylesheetController {
	static async load() {
		await CoreStylesheetLoader.loadUrl(CoreMapboxClient.CSS_URL);
	}
}
