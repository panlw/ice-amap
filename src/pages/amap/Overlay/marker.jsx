import { logger } from 'ice';
import React from 'react';
import { Marker } from 'react-amap-v2';

import CarImg from './assets/car.png';

const CarIcon = () => <img width={36} height={36} src={CarImg} alt="marker" />;

export default function (props) {
  const { position, onClick } = props;
  const events = React.useMemo(() => {
    return {
      click: (e) => {
        const { lnglat, target: marker } = e;
        logger.debug('[AMAP] marker.click:', marker, lnglat, position);
        onClick(lnglat);
      },
    };
  }, [onClick, position]);
  return (
    <Marker
      anchor="center"
      autoRotation
      position={position}
      events={events}
    >
      <CarIcon />
    </Marker>
  );
}
