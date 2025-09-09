<template>
  <q-toolbar
    v-if="runDigestSelected || worksetNameSelected"
    class="q-mb-sm q-mx-sm bg-grey-1 rounded-borders shadow-1"
    >

    <q-select
      v-if="runDigestSelected && runOptions.length > 0"
      v-model="selectedRunOption"
      :options="runOptions"
      :label="$t('Model Run')"
      dense
      outlined
      emit-value
      map-options
      class="col-auto q-mr-md"
      style="min-width: 250px"
      @update:model-value="onRunSelectionChange"
      >
      <template v-slot:selected-item="scope">
        <div class="row items-center no-wrap">
          <q-icon
            :name="getRunStatusIcon(scope.opt)"
            :color="getRunStatusColor(scope.opt)"
            class="q-mr-xs"
            size="sm"
          />
          <span class="ellipsis">{{ scope.opt.label }}</span>
        </div>
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon
              :name="getRunStatusIcon(scope.opt)"
              :color="getRunStatusColor(scope.opt)"
              size="sm"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption class="text-grey-6">
              {{ scope.opt.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-select
      v-if="worksetNameSelected && worksetOptions.length > 0"
      v-model="selectedWorksetOption"
      :options="worksetOptions"
      :label="$t('Input Scenario')"
      dense
      outlined
      emit-value
      map-options
      class="col-auto q-mr-md"
      style="min-width: 250px"
      @update:model-value="onWorksetSelectionChange"
      >
      <template v-slot:selected-item="scope">
        <div class="row items-center no-wrap">
          <q-icon
            name="mdi-folder-edit"
            color="primary"
            class="q-mr-xs"
            size="sm"
          />
          <span class="ellipsis">{{ scope.opt.label }}</span>
        </div>
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon
              name="mdi-folder-edit"
              color="primary"
              size="sm"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption class="text-grey-6">
              {{ scope.opt.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-space />

    <q-btn
      v-if="runDigestSelected"
      @click="onShowRunInfo"
      flat
      dense
      round
      icon="mdi-information-outline"
      :title="$t('Run Information')"
      class="q-mr-xs"
    />
    <q-btn
      v-if="worksetNameSelected"
      @click="onShowWorksetInfo"
      flat
      dense
      round
      icon="mdi-information-outline"
      :title="$t('Scenario Information')"
    />

  </q-toolbar>
</template>

<script>
import { mapState } from 'pinia'
import { useModelStore } from '../stores/model'
import * as Mdf from 'src/model-common'

export default {
  name: 'RunWorksetSelector',

  props: {
    modelDigest: { type: String, default: '' },
    runDigestSelected: { type: String, default: '' },
    worksetNameSelected: { type: String, default: '' },
    refreshTickle: { type: Boolean, default: false }
  },

  data () {
    return {
      selectedRunOption: '',
      selectedWorksetOption: ''
    }
  },

  computed: {
    runOptions () {
      if (!this.runTextList || !Array.isArray(this.runTextList)) return []

      return this.runTextList.map(run => {
        const runText = Mdf.isNotEmptyRunText(run) ? run : Mdf.emptyRunText()
        return {
          label: runText.Name || 'Unknown Run',
          value: runText.RunDigest || '',
          description: this.formatRunDescription(runText),
          status: runText.Status || '',
          updateTime: runText.UpdateDateTime || '',
          runText
        }
      }).sort((a, b) => {
        // Sort by update time, most recent first
        return new Date(b.updateTime) - new Date(a.updateTime)
      })
    },

    worksetOptions () {
      if (!this.worksetTextList || !Array.isArray(this.worksetTextList)) return []

      return this.worksetTextList.map(workset => {
        const worksetText = Mdf.isNotEmptyWorksetText(workset) ? workset : Mdf.emptyWorksetText()
        return {
          label: worksetText.Name || 'Unknown Workset',
          value: worksetText.Name || '',
          description: this.formatWorksetDescription(worksetText),
          updateTime: worksetText.UpdateDateTime || '',
          worksetText
        }
      }).sort((a, b) => {
        // Sort by update time, most recent first
        return new Date(b.updateTime) - new Date(a.updateTime)
      })
    },

    ...mapState(useModelStore, [
      'runTextList',
      'worksetTextList'
    ])
  },

  watch: {
    runDigestSelected: {
      handler (newVal) {
        this.selectedRunOption = newVal || ''
      },
      immediate: true
    },
    worksetNameSelected: {
      handler (newVal) {
        this.selectedWorksetOption = newVal || ''
      },
      immediate: true
    }
  },

  emits: [
    'run-selection-change',
    'workset-selection-change',
    'run-info-click',
    'workset-info-click'
  ],

  methods: {
    formatRunDescription (runText) {
      if (!Mdf.isNotEmptyRunText(runText)) return ''

      const dateStr = Mdf.dtStr(runText.UpdateDateTime)
      const descr = Mdf.descrOfTxt(runText)
      return `${dateStr} ${descr}`.trim()
    },

    formatWorksetDescription (worksetText) {
      if (!Mdf.isNotEmptyWorksetText(worksetText)) return ''

      const dateStr = Mdf.dtStr(worksetText.UpdateDateTime)
      const descr = Mdf.descrOfTxt(worksetText)
      return `${dateStr} ${descr}`.trim()
    },

    getRunStatusIcon (option) {
      if (!option || !option.runText) return 'mdi-help-circle-outline'

      const runText = option.runText
      const isDeleted = !Mdf.isNotEmptyRunText(runText)
      const isSuccess = Mdf.isRunSuccess(runText)
      const isInProgress = Mdf.isRunInProgress(runText)

      if (isDeleted) return 'mdi-delete-circle-outline'
      if (isSuccess) return 'mdi-check-circle-outline'
      if (isInProgress) return 'mdi-run-fast'
      return 'mdi-alert-circle-outline'
    },

    getRunStatusColor (option) {
      if (!option || !option.runText) return 'grey'

      const runText = option.runText
      const isDeleted = !Mdf.isNotEmptyRunText(runText)
      const isSuccess = Mdf.isRunSuccess(runText)
      const isInProgress = Mdf.isRunInProgress(runText)

      if (isDeleted) return 'negative'
      if (isSuccess) return 'positive'
      if (isInProgress) return 'primary'
      return 'warning'
    },

    onRunSelectionChange (newValue) {
      this.$emit('run-selection-change', newValue)
    },

    onWorksetSelectionChange (newValue) {
      this.$emit('workset-selection-change', newValue)
    },

    onShowRunInfo () {
      this.$emit('run-info-click', this.modelDigest, this.runDigestSelected)
    },

    onShowWorksetInfo () {
      this.$emit('workset-info-click', this.modelDigest, this.worksetNameSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
.ellipsis {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
