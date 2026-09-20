<template>
  <div class="contents">
    <button
      class="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
      type="button"
      :disabled="scanning"
      @click="onClick"
    >
      <ScanLine class="w-4 h-4" />
      Digitalizar documento
    </button>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/jpeg,image/png,image/webp,application/pdf"
      @change="onFileChosen"
    />

    <!-- O Teleport só existe quando há algo para mostrar: um `<Teleport to="body">`
         sempre presente é renderizado no SSR e o Vue tenta hidratá-lo contra os
         filhos do <body> (hydration node mismatch). -->
    <!-- Android: câmara ou ficheiro -->
    <Teleport v-if="showChooser || scanning || errorMessage" to="body">
      <div v-if="showChooser" class="modal-overlay" @click.self="showChooser = false">
        <div class="modal-content max-w-sm w-full" @click.stop>
          <h2 class="font-display font-bold text-lg text-white mb-4">Digitalizar documento</h2>
          <div class="space-y-3">
            <button type="button" class="btn-primary w-full flex items-center justify-center gap-2" @click="takePhoto">
              <Camera class="w-4 h-4" /> Tirar foto
            </button>
            <button type="button" class="btn-secondary w-full flex items-center justify-center gap-2" @click="pickFile">
              <FileUp class="w-4 h-4" /> Escolher ficheiro
            </button>
            <button type="button" class="w-full text-sm text-white/40 hover:text-white py-1" @click="showChooser = false">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- A processar -->
      <div v-if="scanning" class="modal-overlay">
        <div class="modal-content max-w-xs w-full text-center" role="status" aria-live="polite">
          <div class="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-white font-semibold">A ler o documento…</p>
          <p class="text-white/40 text-xs mt-1">Pode demorar alguns segundos</p>
        </div>
      </div>

      <!-- Erro / documento não reconhecido -->
      <div v-if="errorMessage" class="modal-overlay" @click.self="errorMessage = ''">
        <div class="modal-content max-w-sm w-full text-center" role="alertdialog" @click.stop>
          <div class="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="w-6 h-6 text-rose-400" />
          </div>
          <p class="text-white/80 text-sm">{{ errorMessage }}</p>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn-secondary flex-1" @click="fillManually">Preencher manualmente</button>
            <button type="button" class="btn-primary flex-1" @click="retry">Tentar outra vez</button>
          </div>
        </div>
      </div>
    </Teleport>

    <PaywallModal
      v-if="showPaywall"
      :required-tier="requiredTierFor('documentScan')"
      feature-label="Digitalizar recibos e faturas"
      @close="showPaywall = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ScanLine, Camera, FileUp, AlertCircle } from 'lucide-vue-next'
import { requiredTierFor } from '~/shared/features'
import type { DocumentScanResult } from '~/types'

const emit = defineEmits<{
  scanned: [result: DocumentScanResult]
  manual: []
}>()

const sub = useSubscription()
const { isNative, capturePhoto, scan } = useDocumentScan()

const fileInput = ref<HTMLInputElement | null>(null)
const showChooser = ref(false)
const showPaywall = ref(false)
const scanning = ref(false)
const errorMessage = ref('')

// Botão sempre visível (Free vê o paywall ao clicar); o enforcement real é o
// requireFeature() do servidor.
function onClick() {
  if (!sub.hasFeature('documentScan')) {
    showPaywall.value = true
    return
  }
  if (isNative.value) showChooser.value = true
  else pickFile()
}

function pickFile() {
  showChooser.value = false
  fileInput.value?.click()
}

async function takePhoto() {
  showChooser.value = false
  let file: File | null
  try {
    file = await capturePhoto()
  } catch (e: any) {
    errorMessage.value = e?.message || 'Não foi possível abrir a câmara.'
    return
  }
  if (file) await run(file)
}

async function onFileChosen(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // permite escolher o mesmo ficheiro outra vez
  if (file) await run(file)
}

async function run(file: File) {
  scanning.value = true
  try {
    emit('scanned', await scan(file))
  } catch (e: any) {
    if (e?.code === 'feature_locked') showPaywall.value = true
    else errorMessage.value = e?.message || 'Erro ao digitalizar o documento.'
  } finally {
    scanning.value = false
  }
}

function retry() {
  errorMessage.value = ''
  onClick()
}

function fillManually() {
  errorMessage.value = ''
  emit('manual')
}
</script>
