import BasicLayout from '@/layouts/BasicLayout';

import Dashboard from '@/pages/Dashboard';

import AmapOverlay from '@/pages/amap/Overlay';
import AmapLocator from '@/pages/amap/Locator';

const routerConfig = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '/amap-overlay',
        component: AmapOverlay,
      },
      {
        path: '/amap-locator',
        component: AmapLocator,
      },

      {
        component: Dashboard,
      },
    ],
  },
];
export default routerConfig;
