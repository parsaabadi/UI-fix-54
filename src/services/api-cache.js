import axios from 'axios'

class ApiCacheService {
  constructor () {
    this.cache = new Map()
    this.pendingRequests = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
    this.maxCacheSize = 1000
    this.omsUrl = ''

    this.keyPatterns = {
      model: (digest, lang) => `model:${digest}:${lang || 'default'}`,
      runList: (digest, lang) => `run-list:${digest}:${lang || 'default'}`,
      run: (modelDigest, runDigest, lang) => `run:${modelDigest}:${runDigest}:${lang || 'default'}`,
      worksetList: (digest, lang) => `workset-list:${digest}:${lang || 'default'}`,
      workset: (modelDigest, name, lang) => `workset:${modelDigest}:${name}:${lang || 'default'}`,
      wordList: (digest, lang) => `word-list:${digest}:${lang || 'default'}`,
      langList: (digest) => `lang-list:${digest}`,
      userView: (modelName) => `user-view:${modelName}`
    }
  }

  setOmsUrl (omsUrl) {
    this.omsUrl = omsUrl || ''
  }

  async get (url, cacheKey, options = {}) {
    const {
      timeout = this.cacheTimeout,
      bypassCache = false,
      language = null
    } = options

    if (!bypassCache) {
      const cached = this.getFromCache(cacheKey, timeout)
      if (cached) {
        return cached
      }
    }

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)
    }

    const requestPromise = this._makeRequest(url, cacheKey, language)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  async _makeRequest (url, cacheKey, language) {
    try {
      const response = await axios.get(url)
      const data = response.data

      this.setCache(cacheKey, data, language)

      return data
    } catch (error) {
      console.warn('API request failed:', url, error.message)
      throw error
    }
  }

  getFromCache (key, timeout = this.cacheTimeout) {
    if (!this.cache.has(key)) return null

    const entry = this.cache.get(key)
    const now = Date.now()

    if (now - entry.timestamp > timeout) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  setCache (key, data, language = null) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      language: language || 'default'
    })
  }

  clearCache (pattern = null) {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    const keysToDelete = []

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clearModelCache (modelDigest) {
    if (!modelDigest) return
    this.clearCache(`^(model|run-list|run|workset-list|workset|word-list|lang-list):${modelDigest}:`)
  }

  clearLanguageCache (oldLang, newLang) {
    if (oldLang && oldLang !== 'default') {
      this.clearCache(`:${oldLang}$`)
    }
  }

  async getModel (digest, language) {
    if (!digest) throw new Error('Model digest is required')

    const cacheKey = this.keyPatterns.model(digest, language)
    const url = this._buildUrl('/api/model', digest, 'pack/text', language)

    return this.get(url, cacheKey, { language })
  }

  async getRunList (modelDigest, language) {
    if (!modelDigest) throw new Error('Model digest is required')

    const cacheKey = this.keyPatterns.runList(modelDigest, language)
    const url = this._buildUrl('/api/model', modelDigest, 'run-list/text', language)

    return this.get(url, cacheKey, { language })
  }

  async getRun (modelDigest, runDigest, language) {
    if (!modelDigest || !runDigest) throw new Error('Model digest and run digest are required')

    const cacheKey = this.keyPatterns.run(modelDigest, runDigest, language)
    const url = this._buildUrl('/api/model', modelDigest, `run/${encodeURIComponent(runDigest)}/text`, language)

    return this.get(url, cacheKey, { language })
  }

  async getWorksetList (modelDigest, language) {
    if (!modelDigest) throw new Error('Model digest is required')

    const cacheKey = this.keyPatterns.worksetList(modelDigest, language)
    const url = this._buildUrl('/api/model', modelDigest, 'workset-list/text', language)

    return this.get(url, cacheKey, { language })
  }

  async getWorkset (modelDigest, worksetName, language) {
    if (!modelDigest || !worksetName) throw new Error('Model digest and workset name are required')

    const cacheKey = this.keyPatterns.workset(modelDigest, worksetName, language)
    const url = this._buildUrl('/api/model', modelDigest, `workset/${encodeURIComponent(worksetName)}/text`, language)

    return this.get(url, cacheKey, { language })
  }

  async getWordList (modelDigest, language) {
    if (!modelDigest) throw new Error('Model digest is required')

    const cacheKey = this.keyPatterns.wordList(modelDigest, language)
    const url = this._buildUrl('/api/model', modelDigest, 'word-list', language)

    return this.get(url, cacheKey, { language })
  }

  async getLangList (modelDigest) {
    if (!modelDigest) throw new Error('Model digest is required')

    const cacheKey = this.keyPatterns.langList(modelDigest)
    const url = this._buildUrl('/api/model', modelDigest, 'lang-list')

    return this.get(url, cacheKey)
  }

  async getUserView (modelName) {
    if (!modelName) throw new Error('Model name is required')

    const cacheKey = this.keyPatterns.userView(modelName)
    const omsUrl = this.omsUrl || ''
    const url = `${omsUrl}/api/user/view/model/${encodeURIComponent(modelName)}`

    return this.get(url, cacheKey, { timeout: 30 * 1000 })
  }

  _buildUrl (basePath, digest, endpoint, language) {
    const omsUrl = this.omsUrl || ''
    let url = `${omsUrl}${basePath}/${encodeURIComponent(digest)}/${endpoint}`

    if (language && language !== '') {
      url += `/lang/${encodeURIComponent(language)}`
    }

    return url
  }

  getCacheStats () {
    const stats = {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      pendingRequests: this.pendingRequests.size,
      entries: []
    }

    for (const [key, entry] of this.cache.entries()) {
      stats.entries.push({
        key,
        age: Date.now() - entry.timestamp,
        language: entry.language
      })
    }

    return stats
  }
}

const apiCache = new ApiCacheService()

export default apiCache
