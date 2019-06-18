<template>
  <v-layout column>
    <v-flex xs12>
      <v-text-field
        class="textField"
        name="markdown-1"
        rows="10"
        autofocus
        textarea
        v-model="txt"
      ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-text-field
        class="textField"
        name="markdown-2"
        rows="10"
        autofocus
        textarea
        v-model="txt2"
      ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-text-field
        class="textField"
        name="markdown-3"
        rows="10"
        autofocus
        textarea
        v-model="txt3"
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  computed: {
    txt: {
      get () {
        return this.$store.state.txt
      },
      set (value) {
        this.$store.commit('SET_MARKDOWN', value)
        window.localStorage.setItem(`chatMD.last`, value)
      }
    },
    txt2: {
      get () {
        return this.$store.state.txt2
      },
      set (value) {
        this.$store.commit('SET_MARKDOWN2', value)
        window.localStorage.setItem(`chatMD.last2`, value)
      }
    },
    txt3: {
      get () {
        return this.$store.state.txt3
      },
      set (value) {
        this.$store.commit('SET_MARKDOWN3', value)
        window.localStorage.setItem(`chatMD.last3`, value)
      }
    }
  }
}
</script>
