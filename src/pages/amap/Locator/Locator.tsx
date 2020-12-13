import '@amap/amap-jsapi-types';
import { logger } from 'ice';
import React from 'react';
import { Marker } from 'react-amap-v2';

import { Form, Select, Tag } from '@alifd/next';
// @ts-ignore
import styles from './index.module.scss';

import {
  useServices, AmapLoc, AmapPos,
  amapSearch, amapLocate, amapLnglat,
  setFitView,
} from '@/lib/amap-v2';

type AmapApi = {
  search?: (keyword: string) => Promise<AmapPos[]>,
  locate?: (location: AmapLoc) => Promise<AmapPos>,
  lnglat?: (address: string) => Promise<AmapPos>,
}

const SVC_SPECS = [{
  name: 'AutoComplete',
  opts: {
    // city: '全国', // 限定城市，默认全国
    outPutDirAuto: true,
  },
}, {
  name: 'Geocoder',
  opts: {
    // radius: 1000, // 逆地理编码时，以给定坐标为中心点，单位：米；取值范围：0-3000；默认值：1000
    extensions: 'all',
  },
}];

function useAmapApi() {
  const [svcs, map] = useServices(SVC_SPECS);
  const [amapApi, setAmapApi] = React.useState<AmapApi>();
  React.useEffect(() => {
    if (svcs.length) {
      const [autoComplete, geocoder] = svcs;
      const api: AmapApi = {};
      if (autoComplete) {
        // 关键字 => 地址列表
        api.search = (keyword) => {
          return !keyword
            ? Promise.resolve([])
            : amapSearch(autoComplete, keyword);
        };
      }
      if (geocoder) {
        // 经纬度([lng, lat]) => 地址
        api.locate = (lnglat) => amapLocate(geocoder, lnglat);
        // 地址 => 经纬度([lng, lat])
        api.lnglat = (address) => amapLnglat(geocoder, address);
      }
      setAmapApi(api);
    }
  }, [svcs]);
  return [amapApi, map];
}

type SearchTip = {
  value: string,
  label: string,
  pos: AmapPos,
}

export default function () {
  const [amapApi, map] = useAmapApi();

  const [tips, setTips] = React.useState<SearchTip[]>([]);
  const onSearch = async (keyword: string) => {
    logger.debug('[AMAP] onSearch:', keyword);
    if (!keyword || !amapApi || !amapApi.search) return;

    const items = await amapApi.search(keyword);
    if (!items) return;

    const tipsNew = items.map((pos: AmapPos) => {
      const value = pos.addr;
      return { value, label: value, pos };
    });
    setTips(tipsNew);
  };

  const [loc, setLoc] = React.useState<AmapLoc>();
  const onLocate = async ({ keyword }) => {
    logger.debug('[AMAP] onLocate:', keyword);
    if (!keyword || !amapApi || !amapApi.search) return;

    const tip = tips.find((x) => x.value === keyword);
    let locNew: AmapLoc;
    if (tip) {
      const { lng, lat } = tip.pos;
      locNew = [lng, lat];
    } else {
      const items = await amapApi.search(keyword);
      if (!items || !items.length) return;

      const { lng, lat } = items[0]; // 第一个地点最近
      locNew = [lng, lat];
    }
    if (locNew) {
      setLoc(locNew);
      setFitView(map, 1, 'marker');
    }
  };

  return (
    <>
      <Form inline>
        <Form.Item className={styles.search}>
          <Select.AutoComplete
            name="keyword"
            placeholder="地址关键字搜索"
            onChange={onSearch}
            dataSource={tips}
            filterLocal={false}
            fillProps="value"
            hasClear
          />
          <Form.Submit type="primary" onClick={onLocate}>定位</Form.Submit>
        </Form.Item>
        <Form.Item className={styles.location}>
          {loc ? <Tag color="turquoise">经：{loc[0]}，纬：{loc[1]}</Tag> : ''}
        </Form.Item>
      </Form>

      {loc ? <Marker position={loc} /> : ''}
    </>
  );
}
