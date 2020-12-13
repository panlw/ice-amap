import React from 'react';
import { Map, Scale } from 'react-amap-v2';

import Locator from './Locator';

const none = {};

export default function () {
  return (
    <Map style={none} className="map-container">
      <Scale />
      <Locator />
    </Map>
  );
}
