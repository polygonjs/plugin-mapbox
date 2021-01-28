# Polygonjs Mapbox Plugin

This adds several nodes to work with Mapbox with the [Polygonjs webgl engine](https://polygonjs.com).

See [example scene](https://github.com/polygonjs/example-plugin-mapbox):

![example scene with mapbox camera](https://github.com/polygonjs/example-plugin-mapbox/blob/main/doc/mapbox_examples.jpg?raw=true)

# Install

Import the plugin:

`yarn add @polygonjs/plugin-mapbox`

And register the plugin in the function `configurePolygonjs` in the file `PolyConfig.js` so that the mapbox nodes can be accessible in both the editor and your exported scene:

```js
import {polyPluginMapbox} from '@polygonjs/plugin-mapbox/dist/src/index';

export function configurePolygonjs(poly) {
	poly.registerPlugin(polyPluginMapbox);
	polyPluginMapbox.setToken('<your-mapbox-token>');
}
```
