import { logger } from 'ice';
import React from 'react';

import { AutoMap } from '@/lib/amap-ui';

import styles from './index.module.scss';
import CarMarker from './marker';

const MAP_CENTER = [116.473179, 39.993169];

function loadRandomMarkers(n = 9) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const [x0, y0] = MAP_CENTER;
      const markers = new Array(n);
      for (let i = 0; i < n; i++) {
        markers[i] = [x0 + Math.random() - 0.5, y0 + Math.random() - 0.5];
      }
      logger.debug('markers:', markers);
      resolve(markers);
    }, 500);
  });
}

export default function () {
  const [markers, setMarkers] = React.useState();
  React.useEffect(() => {
    loadRandomMarkers().then(setMarkers);
  }, []);

  const [position, setPosition] = React.useState(MAP_CENTER);
  return (
    <AutoMap overlayType="marker" expectedNum={markers ? markers.length : 0}>
      {markers && markers.map((x, i) => (
        <CarMarker key={x} position={x} onClick={() => setPosition(x)} />
      ))}
      <div className={styles.position}>
        Marker的坐标: {position.join(', ')}
      </div>
    </AutoMap>
  );
}
