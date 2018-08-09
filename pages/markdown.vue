<template>
  <v-layout>
    <v-flex xs12>
      <v-text-field
        class="textField"
        name="input-1"
        rows="10"
        autofocus
        textarea
        v-model="txt"
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      txt: this.$store.state.txt
    }
  }
}
</script>
