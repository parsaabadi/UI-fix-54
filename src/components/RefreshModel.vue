<!-- reload current model by digest -->
<script>
import { mapState, mapActions } from 'pinia'
import { useModelStore } from '../stores/model'
import { useServerStateStore } from '../stores/server-state'
import { useUiStateStore } from '../stores/ui-state'
import * as Mdf from 'src/model-common'

export default {
  name: 'RefershModel',

  props: {
    digest: { type: String, default: '' },
    refreshTickle: { type: Boolean, default: false }
  },

  render () { return null }, // no html

  data () {
    return {
      loadDone: false,
      loadWait: false
    }
  },

  computed: {
    ...mapState(useModelStore, [
      'theModel'
    ]),
    ...mapState(useServerStateStore, {
      omsUrl: 'omsUrl'
    }),
    ...mapState(useUiStateStore, ['uiLang'])
  },

  watch: {
    refreshTickle () { this.doRefresh() }
  },

  emits: ['done', 'wait'],

  methods: {
    ...mapActions(useModelStore, [
      'dispatchTheModel',
      'dispatchWordList',
      'dispatchLangList'
    ]),

    // refersh current model
    async doRefresh () {
      if (!this.digest) {
        console.warn('Unable to refresh model: digest is empty')
        this.$q.notify({ type: 'negative', message: this.$t('Unable to refresh model: digest is empty') })
        return
      }

      this.loadDone = false
      this.loadWait = true
      this.$emit('wait')
      let dgst = ''
      let isOk = false

      this.$apiCache.setOmsUrl(this.omsUrl)

      try {
        const d = await this.$apiCache.getModel(this.digest, this.uiLang)
        if (Mdf.isModel(d)) {
          dgst = Mdf.modelDigest(d)
          isOk = dgst === this.digest
          if (isOk) this.dispatchTheModel(d) // update current model in store
        }
        this.loadDone = true
      } catch (e) {
        console.warn('Server offline or model not found.', e.message)
        this.$q.notify({ type: 'negative', message: this.$t('Server offline or model not found: ') + this.digest })
      }

      // on error notify user and exit
      if (!isOk) {
        this.$emit('done', isOk, dgst)
        this.loadWait = false

        console.warn('Unable to refresh model by digest:', this.digest, ':', dgst, ':')
        this.$q.notify({ type: 'negative', message: this.$t('Unable to refresh model by digest: ', this.digest) })
        return
      }

      try {
        // refresh model "words" language-specific strings using cached API
        const wordData = await this.$apiCache.getWordList(this.digest, this.uiLang)
        this.dispatchWordList(wordData) // update model words list in store
      } catch (e) {
        console.warn('Server offline or model words refresh failed', e.message)
        this.$q.notify({ type: 'negative', message: this.$t('Server offline or model words refresh failed') })
      }

      try {
        // refresh list of model languages using cached API
        const langData = await this.$apiCache.getLangList(this.digest)
        this.dispatchLangList(langData) // update list of model languages in store
      } catch (e) {
        console.warn('Server offline or languages list refresh failed', e.message)
        this.$q.notify({ type: 'negative', message: this.$t('Server offline or languages list refresh failed') })
      }

      this.$emit('done', isOk, dgst) // notify user on success
      this.loadWait = false
    }
  },

  mounted () {
    // if model already loaded then exit
    if (!!this.digest && Mdf.modelDigest(this.theModel) === this.digest) {
      this.$emit('done', true, this.digest)
      return
    }
    this.doRefresh() // else load new model
  }
}
</script>
