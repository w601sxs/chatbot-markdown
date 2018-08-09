<template>
  <v-layout>
    <v-flex xs12>
      <div class="bot-container">
        <div class="bot-msg-container" v-html="jsonToHTML"></div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { jsonToHTML } from '~/utils/helpers'
export default {
  methods: {
    jsonToHTML () {
      return jsonToHTML()
    }
  }
}
</script>

