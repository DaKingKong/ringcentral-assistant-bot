import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/root';
import { Client } from './lib/client';

const client = new Client(window.clientConfig);
window.client = client;

ReactDOM.render(
    <App client={client} />,
    document.querySelector('div#viewport')
);