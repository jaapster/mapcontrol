// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/cp-app-gl';

const app = document.getElementById('app');

if (app) {
	ReactDOM.render(<App />, app);
}
