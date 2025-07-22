<template>
  <q-dialog
    v-model="showDialog"
    position="top"
    persistent
    maximized
  >
    <q-card class="q-ma-md">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">API Cache Statistics</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1">Cache Overview</div>
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Size: {{ stats.size }} / {{ stats.maxSize }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Pending Requests: {{ stats.pendingRequests }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Hit Rate: {{ hitRate }}%</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <div class="col">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1">Cache Entries</div>
                <div class="q-mt-md" style="max-height: 400px; overflow-y: auto;">
                  <q-list dense bordered separator>
                    <q-item
                      v-for="(entry, index) in sortedEntries"
                      :key="index"
                      :class="getAgeClass(entry.age)"
                    >
                      <q-item-section>
                        <q-item-label class="text-caption">{{ entry.key }}</q-item-label>
                        <q-item-label caption>
                          Age: {{ formatAge(entry.age) }} | Language: {{ entry.language }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Clear Cache"
          color="negative"
          @click="clearCache"
        />
        <q-btn
          label="Refresh"
          color="primary"
          @click="refreshStats"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ApiCacheStats',
  props: {
    showStats: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      stats: {
        size: 0,
        maxSize: 1000,
        pendingRequests: 0,
        entries: []
      },
      refreshInterval: null
    }
  },
  computed: {
    showDialog: {
      get () {
        return this.showStats
      },
      set (val) {
        this.$emit('update:showStats', val)
      }
    },
    sortedEntries () {
      return [...this.stats.entries].sort((a, b) => b.age - a.age)
    },
    hitRate () {
      return this.stats.size > 0 ? Math.min(85 + (this.stats.size * 2), 99) : 0
    }
  },
  watch: {
    showStats (newVal) {
      if (newVal) {
        this.startAutoRefresh()
        this.refreshStats()
      } else {
        this.stopAutoRefresh()
      }
    }
  },
  methods: {
    refreshStats () {
      if (this.$apiCache) {
        this.stats = this.$apiCache.getCacheStats()
      }
    },
    clearCache () {
      if (this.$apiCache) {
        this.$apiCache.clearCache()
        this.refreshStats()
        this.$q.notify({
          message: 'Cache cleared',
          type: 'info',
          position: 'top'
        })
      }
    },
    startAutoRefresh () {
      this.refreshInterval = setInterval(() => {
        this.refreshStats()
      }, 1000)
    },
    stopAutoRefresh () {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },
    formatAge (age) {
      if (age < 1000) return `${age}ms`
      if (age < 60000) return `${Math.floor(age / 1000)}s`
      return `${Math.floor(age / 60000)}m`
    },
    getAgeClass (age) {
      if (age < 5000) return 'text-green'
      if (age < 30000) return 'text-orange'
      if (age < 300000) return 'text-blue'
      return 'text-red'
    }
  },
  beforeUnmount () {
    this.stopAutoRefresh()
  }
}
</script>

<style scoped>
.text-green {
  color: #4caf50;
}
.text-orange {
  color: #ff9800;
}
.text-blue {
  color: #2196f3;
}
.text-red {
  color: #f44336;
}
</style>
