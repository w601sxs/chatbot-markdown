<template>
  <v-layout>
    <v-flex xs12>
      <div class="bot-container">
        <div class="bot-msg-container" v-html="jsonToHTML()"></div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { jsonToHTML } from '~/utils/helpers'

export default {
  methods: {
    jsonToHTML () {
      if (this.$store.state.txt) {
        return jsonToHTML(this.$store.state.txt)
      }
    }
  }
}
</script>

