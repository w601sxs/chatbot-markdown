<template>
  <div
    :class="
      [
        msg.to === userId ? 'msg-content bot' : 'msg-content human',
        (new Date(msg.date) > timeStart) ? (msg.to === userId ? 'fade-in-left' : 'fade-in-right') : null
      ]
    "
    transition="slide-x-transition"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="renderMessage(msg.message)"></div>
    <div :class="msg.to === userId ? 'msg-timestamp bot' : 'msg-timestamp human'">
      {{ msg.date | unixToTime }}
    </div>
  </div>
</template>

<script>
import { renderMessage } from '~/utils/helpers'

export default {
  props: {
    msg: {
      type: Object,
      default: () => {}
    },
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      timeStart: new Date()
    }
  },
  methods: {
    renderMessage(msg) {
      return renderMessage(msg)
    }
  }
}
</script>
