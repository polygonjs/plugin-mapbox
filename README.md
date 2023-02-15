# DEPRECATED

This repository is not used anymore, as the mapbox nodes have been fully integrated into the [core engine](https://polygonjs.com). See [live examples scenes](https://polygonjs.com/docs/examples-category/Maps)

# Polygonjs Mapbox Plugin

This adds several nodes to work with Mapbox with the [Polygonjs webgl engine](https://polygonjs.com).

See [Live Demo](https://polygonjs-mapbox-example.netlify.app/) or [example repo](https://github.com/polygonjs/example-plugin-mapbox):

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
