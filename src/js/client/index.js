// @flow

import { Control } from '../mapcontrol/gl/control';

const _canvas = document.createElement('canvas');

const body = document.body;

if (body) body.appendChild(_canvas);

_canvas.width = 2048;
_canvas.height = 1024;

const control = Control.create(_canvas);

console.log(control._rotation); // todo: remove
