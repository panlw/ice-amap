import React from 'react';
import { logger } from 'ice';
import { Map } from 'react-amap-v2';
import { setFitView } from './amap-v2';

export const none = {};
export const noop = () => { };

type AutoMapProps = {
  /**
   * 覆盖物类型
   */
  overlayType?: string,
  /**
   * 期望的数量
   */
  expectedNum: number,

  children: React.ReactNode[],
}

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
    return mapRef.current ? setFitView(mapRef.current, expectedNum, overlayType) : noop;
  }, [expectedNum, overlayType]);

  return (
    <Map style={none} className="map-container" events={events} >
      {children}
    </Map>
  );
}
