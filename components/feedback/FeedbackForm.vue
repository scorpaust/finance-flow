<template>
  <div>
    <div v-if="sent" class="text-center py-6" data-testid="feedback-sent">
      <div class="text-4xl mb-3">✅</div>
      <h3 class="font-semibold text-white mb-2">{{ t('feedback.successTitle') }}</h3>
      <p class="text-white/50 text-sm mb-5">{{ contactOk ? t('feedback.successBody') : t('feedback.successBodyNoContact') }}</p>
      <button class="btn-secondary text-sm" type="button" @click="reset">{{ t('feedback.another') }}</button>
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div>
        <p class="form-label">{{ t('feedback.typeLabel') }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="ty in FEEDBACK_TYPES"
            :key="ty"
            type="button"
            :data-testid="`feedback-type-${ty}`"
            class="text-sm px-3 py-1.5 rounded-xl border transition-colors"
            :class="type === ty ? 'bg-brand-600/30 border-brand-500/50 text-white' : 'border-white/10 text-white/60 hover:text-white'"
            @click="type = ty"
          >
            {{ t(`feedback.types.${ty}`) }}
          </button>
        </div>
      </div>
      <div>
        <label class="form-label" for="feedback-message">{{ t('feedback.messageLabel') }}</label>
        <textarea
          id="feedback-message"
          v-model="message"
          data-testid="feedback-message"
          class="form-input min-h-[140px]"
          :maxlength="FEEDBACK_MAX_LENGTH"
          :placeholder="t('feedback.messagePlaceholder')"
          required
        />
        <p class="text-white/30 text-xs text-right mt-1">{{ t('feedback.counter', { count: message.length, max: FEEDBACK_MAX_LENGTH }) }}</p>
      </div>
      <label class="flex items-start gap-3 cursor-pointer">
        <input v-model="contactOk" type="checkbox" class="mt-0.5 w-4 h-4 shrink-0 accent-brand-500" data-testid="feedback-contact" />
        <span class="text-white/60 text-sm">{{ t('feedback.contactLabel') }}</span>
      </label>
      <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
      <button class="btn-primary flex items-center gap-2" type="submit" :disabled="sending || message.trim().length < 3" data-testid="feedback-submit">
        <Loader2 v-if="sending" class="w-4 h-4 animate-spin" />
        <Send v-else class="w-4 h-4" />
        {{ t('feedback.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Send } from 'lucide-vue-next'
import { Capacitor } from '@capacitor/core'
import { FEEDBACK_MAX_LENGTH, FEEDBACK_TYPES, type FeedbackType } from '~/shared/feedback'

// Upgrade 09 — formulário de "Ajuda e opinião". Envia só o contexto técnico
// necessário: plataforma, versão da app (Android) e a página de onde veio.
const props = defineProps<{ fromPage?: string }>()
const { t } = useI18n()

const type = ref<FeedbackType>('idea')
const message = ref('')
const contactOk = ref(true)
const sending = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function appContext() {
  const native = Capacitor.isNativePlatform()
  let appVersion: string | undefined
  if (native) {
    try {
      const { App } = await import('@capacitor/app')
      appVersion = (await App.getInfo()).version
    } catch {
      appVersion = undefined
    }
  }
  return { platform: native ? 'android' : 'web', appVersion, page: props.fromPage?.slice(0, 120) }
}

async function submit() {
  sending.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: { type: type.value, message: message.value, contactOk: contactOk.value, context: await appContext() },
    })
    sent.value = true
  } catch (e: any) {
    errorMessage.value = e?.data?.message || t('feedback.errorGeneric')
  } finally {
    sending.value = false
  }
}

function reset() {
  sent.value = false
  message.value = ''
  type.value = 'idea'
}
</script>
