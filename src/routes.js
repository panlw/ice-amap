import BasicLayout from '@/layouts/BasicLayout';

import Dashboard from '@/pages/Dashboard';
import AmapOverlay from '@/pages/amap/Overlay';

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
        component: Dashboard,
      },
    ],
  },
];
export default routerConfig;
