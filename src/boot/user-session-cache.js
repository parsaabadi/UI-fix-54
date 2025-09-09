import { boot } from 'quasar/wrappers'
import userSessionCache from '../services/user-session-cache.js'

export default boot(({ app }) => {
  app.config.globalProperties.$userSession = userSessionCache
  app.provide('userSession', userSessionCache)
})

export { userSessionCache }
