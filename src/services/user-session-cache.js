class UserSessionCacheService {
  constructor () {
    this.STATE_PREFIX = '$session-'
    this.sessionData = new Map()
  }

  _getSessionKey (modelName, dataType) {
    return `${modelName}:${dataType}`
  }

  async saveTreeExpansion (modelName, treeType, expandedKeys) {
    if (!modelName || !treeType) return

    const sessionKey = this._getSessionKey(modelName, `tree-${treeType}`)
    this.sessionData.set(sessionKey, expandedKeys)
  }

  async getTreeExpansion (modelName, treeType) {
    if (!modelName || !treeType) return []

    const sessionKey = this._getSessionKey(modelName, `tree-${treeType}`)
    return this.sessionData.get(sessionKey) || []
  }

  clearSession () {
    this.sessionData.clear()
  }

  clearModelSession (modelName) {
    for (const [key] of this.sessionData) {
      if (key.startsWith(`${modelName}:`)) {
        this.sessionData.delete(key)
      }
    }
  }
}

const userSessionCache = new UserSessionCacheService()
export default userSessionCache
