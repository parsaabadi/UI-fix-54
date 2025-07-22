import MainLayout from 'layouts/MainLayout'
import ModelList from 'pages/ModelList.vue'
import ModelPage from 'pages/ModelPage.vue'
import NotFound404 from 'pages/NotFound404.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: ModelList },
      {
        path: 'model/:digest',
        component: ModelPage,
        props: true,
        children: [
          {
            path: 'run-list',
            component: () => import('pages/RunList.vue'),
            props: true
          },
          {
            path: 'set-list',
            component: () => import('pages/WorksetList.vue'),
            props: true
          },
          {
            path: 'run/:runDigest/parameter/:parameterName',
            component: () => import('pages/ParameterPage.vue'),
            props: true
          },
          {
            path: 'set/:worksetName/parameter/:parameterName',
            component: () => import('pages/ParameterPage.vue'),
            props: true
          },
          {
            path: 'run/:runDigest/table/:tableName',
            component: () => import('pages/TablePage.vue'),
            props: true
          },
          {
            path: 'run/:runDigest/entity/:entityName',
            component: () => import('pages/EntityPage.vue'),
            props: true
          },
          {
            name: 'new-model-run',
            path: 'new-run',
            component: () => import('pages/NewRun.vue'),
            props: true
          },
          {
            path: 'run-log/:stamp',
            component: () => import('pages/RunLog.vue'),
            props: true
          },
          {
            path: 'updown-list',
            component: () => import('pages/UpDownList.vue'),
            props: true
          }
        ]
      },
      {
        path: 'updown-list/model/:digest',
        component: () => import('pages/UpDownList.vue'),
        props: true
      },
      { path: 'service-state', component: () => import('pages/ServiceState.vue') },
      { path: 'settings', component: () => import('pages/SessionSettings.vue') },
      { path: 'disk-use', component: () => import('pages/DiskUse.vue') },
      { path: 'license', component: () => import('pages/LicensePage.vue') }
    ]
  },
  // Always leave this as last one, but you can also remove it
  {
    path: '/:catchAll(.*)*', component: NotFound404
    // component: () => import('pages/NotFound404.vue')
  }
]

export default routes
