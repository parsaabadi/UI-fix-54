import { boot } from 'quasar/wrappers'
import apiCache from '../services/api-cache.js'

export default boot(({ app }) => {
  app.config.globalProperties.$apiCache = apiCache
  app.provide('apiCache', apiCache)
})

export { apiCache }
