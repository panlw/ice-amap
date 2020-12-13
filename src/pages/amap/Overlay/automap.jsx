import React from 'react';
import { Map } from 'react-amap-v2';

import { amapFitView } from '@/lib/amap';

export default function ({ promise, children }) {
  const mapRef = React.useRef();

  React.useEffect(() => {
    let cleanup;
    promise().then((num, type) => {
      cleanup = amapFitView(mapRef.current, num, type);
    });
    return cleanup;
  }, [promise]);

  const events = React.useMemo(() => {
    return {
      created: (map) => {
        mapRef.current = map;
      },
      // click: (e) => {
      //   const map = e.target;
      //   map.setFitView(null, true);
      // },
    };
  }, []);

  return (
    <Map style={{}} className="map-container" events={events}>
      {children}
    </Map>
  );
}
