import '@amap/amap-jsapi-types';
import { logger } from 'ice';
import React from 'react';
import { usePlugin } from 'react-amap-v2';

export function setFitView($map: AMap.Map, expectedNum: number, overlayType?: string): () => void {
  const $win: Window = window;
  let $timer = $win.setInterval(() => {
    const $overlays = $map.getAllOverlays(overlayType);
    logger.debug(`[AMAP] marker count: ${$overlays.length}`);
    if ($overlays.length === expectedNum) {
      $win.clearInterval($timer);
      $timer = 0;
      $map.setFitView();
    }
  }, 200);
  return () => $timer && $win.clearInterval($timer);
}

export type AmapSvc = any;
export type AmapSvcSpec = {
  /**
   * 插件名
   */
  name: string,
  /**
   * 插件选项
   */
  opts: any,
}

// AutoComplete: https://lbs.amap.com/api/jsapi-v2/guide/services/autocomplete
// Geocoder: https://lbs.amap.com/api/jsapi-v2/guide/services/geocoder
// GraspRoad: https://lbs.amap.com/api/jsapi-v2/guide/services/grasp
// Geolocation: https://lbs.amap.com/api/jsapi-v2/guide/services/geolocation
// Driving: https://lbs.amap.com/api/jsapi-v2/guide/services/navigation
export function useServices(specs: AmapSvcSpec[]): AmapSvc[] {
  const { loaded, map } = usePlugin(specs.map((x) => `AMap.${x.name}`));
  const [plugins, setPlugins] = React.useState<AmapSvc[]>([]);
  React.useEffect(() => {
    if (loaded && map) {
      const $AMap: any = window.AMap;
      setPlugins(specs.map((x, i) => {
        const PluginClass = $AMap[x.name];
        return PluginClass ? new PluginClass(x.opts[i] || {}) : null;
      }));
    }
  }, [specs, loaded, map]);
  return [plugins, map];
}

export type ResolveFn = (asyncResult?: any) => void
export type AmapLoc = [number, number]
export type AmapPos = {
  lng: number,
  lat: number,
  addr: string,
}

export type AmapLngLat = { lng: number, lat: number }
export type AmapTip = {
  id: string,
  name: string,
  adcode: string,
  address: string,
  location: AmapLngLat,
}

const amapTip2Pos = (tip: AmapTip): AmapPos => {
  const { name: addr, location } = tip;
  const { lng, lat } = location;
  return { lng, lat, addr };
};

export type AmapSearchFn = (autoComplete: AmapSvc, keyword: string) => Promise<AmapPos[]>

export const amapSearch: AmapSearchFn = (autoComplete, keyword) => {
  return new Promise((resolve: ResolveFn) => {
    autoComplete.search(keyword, (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        logger.debug('[AMAP] search:', result.tips);
        resolve(result.tips.filter((x: AmapTip) => x.id).map(amapTip2Pos));
      } else {
        resolve();
      }
    });
  });
};

export type AmapLocateFn = (geocoder: AmapSvc, location: AmapLoc) => Promise<AmapPos>

export const amapLocate: AmapLocateFn = (geocoder, location) => {
  return new Promise((resolve: ResolveFn) => {
    geocoder.getAddress(location, (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        const [lng, lat] = location;
        const { regeocode } = result;
        const { formattedAddress: addr } = regeocode;
        resolve({ lng, lat, addr });
      } else {
        resolve();
      }
    });
  });
};

export type AmapLngLatFn = (geocoder: AmapSvc, address: string) => Promise<AmapPos>

export const amapLnglat: AmapLngLatFn = (geocoder, address) => {
  return new Promise((resolve: ResolveFn) => {
    geocoder.getLocation(address, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        const { geocodes } = result;
        if (!geocodes.length) resolve();

        const { formattedAddress: addr, location } = geocodes[0]; // 第一个最近
        const [lng, lat] = location;
        resolve({ lng, lat, addr });
      } else {
        resolve();
      }
    });
  });
};
