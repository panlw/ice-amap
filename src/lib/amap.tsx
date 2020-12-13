import '@amap/amap-jsapi-types';
import { logger } from 'ice';
import React from 'react';
import { Map } from 'react-amap-v2';

type AutoMapProps = {
  overlayType?: string,
  expectedNum: number,
  children: React.ReactNode[],
}

const none = {};
const noop = () => { };

export function AutoMap(props: AutoMapProps): React.ReactNode {
  const mapRef = React.useRef<any>();
  const events: any = React.useMemo(() => {
    // @see https://lbs.amap.com/api/jsapi-v2/guide/events/map_overlay
    return {
      created: (map: AMap.Map) => {
        mapRef.current = map;
      },
      // click: (e) => {
      //   const map = e.target;
      //   map.setFitView(null, true);
      // },
    };
  }, []);

  const { children, overlayType, expectedNum } = props;
  logger.debug('[AMAP] props:', overlayType, expectedNum);
  React.useEffect(() => {
    return mapRef.current ? $fitView(mapRef.current, expectedNum, overlayType) : noop;
  }, [expectedNum, overlayType]);

  return (
    <Map style={none} className="map-container" events={events} >
      {children}
    </Map>
  );
}

const $vm = window;

function $fitView($map: AMap.Map, expectedNum: number, overlayType?: string): () => void {
  let $timer = $vm.setInterval(() => {
    const $overlays = $map.getAllOverlays(overlayType);
    logger.debug(`[AMAP] marker count: ${$overlays.length}`);
    if ($overlays.length === expectedNum) {
      $vm.clearInterval($timer);
      $timer = 0;
      $map.setFitView();
    }
  }, 200);
  return () => $timer && $vm.clearInterval($timer);
}
