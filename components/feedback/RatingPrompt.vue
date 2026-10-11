<template>
  <div v-if="visible" class="glass-card rounded-3xl p-5 border border-brand-500/20" data-testid="rating-prompt">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-white">{{ done ? t('rating.thanks') : t('rating.title') }}</h3>
        <p v-if="!done" class="text-white/50 text-sm mt-0.5">{{ t('rating.question') }}</p>
      </div>
      <button class="btn-icon w-8 h-8" type="button" :aria-label="t('common.close')" @click="visible = false"><X class="w-4 h-4" /></button>
    </div>
    <template v-if="!done">
      <div class="flex gap-2 mt-3" role="radiogroup" :aria-label="t('rating.question')">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          role="radio"
          :aria-checked="rating === n"
          :aria-label="`${n}/5`"
          class="w-10 h-10 rounded-xl border text-sm font-semibold transition-colors"
          :class="rating && n <= rating ? 'bg-brand-600/40 border-brand-500/60 text-white' : 'border-white/10 text-white/50 hover:text-white'"
          @click="rating = n"
        >
          {{ n }}
        </button>
      </div>
      <textarea
        v-if="rating"
        v-model="comment"
        class="form-input mt-3 min-h-[70px] text-sm"
        maxlength="2000"
        :placeholder="t('rating.commentPlaceholder')"
      />
      <button v-if="rating" class="btn-primary text-sm mt-3" type="button" :disabled="sending" @click="submit">{{ t('rating.submit') }}</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Capacitor } from '@capacitor/core'

// Upgrade 09 — pedido de opinião curto (1 a 5) no painel, só na web (na app
// Android há o pedido de avaliação da loja, Upgrade 07). O servidor decide se
// aparece e regista-o — aparece uma só vez, mesmo que o utilizador o feche.
const { t } = useI18n()
const visible = ref(false)
const done = ref(false)
const rating = ref<number | null>(null)
const comment = ref('')
const sending = ref(false)

onMounted(async () => {
  if (Capacitor.isNativePlatform()) return
  try {
    const { show } = await $fetch<{ show: boolean }>('/api/feedback/rating-prompt', { method: 'POST' })
    visible.value = show
  } catch {
    visible.value = false
  }
})

async function submit() {
  if (!rating.value) return
  sending.value = true
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: { type: 'rating', rating: rating.value, message: comment.value.trim(), contactOk: false, context: { platform: 'web', page: '/' } },
    })
    done.value = true
    setTimeout(() => { visible.value = false }, 2500)
  } catch {
    visible.value = false
  } finally {
    sending.value = false
  }
}
</script>
