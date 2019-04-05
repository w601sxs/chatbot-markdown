<template>
  <v-layout row class="textArea mt-3">
    <v-flex xs12>
      <div v-html="nomnomlMd"></div>  
    </v-flex>
  </v-layout>
</template>


<script>
import nomnoml from 'nomnoml'
import { markdownToJson, jsonToNom } from '~/utils/helpers'

export default {
  computed: {
    nomnomlMd () {
      let json = markdownToJson(this.$store.state.txt)

      // prevent error if json is blank
      if (json && json.length !== 0) {
        try {
          let nom = jsonToNom(json)
          if (nom && nom.trim() !== '' && nom !== '[]') {
            return nomnoml.renderSvg(nom)
          }
        } catch (err) {
          console.log(err)
          return `Error: ${err}`
        }
      } else {
        return ''
      }
    }
  },
  watch: {
    txt: {
      handler: function () {
        window.localStorage.setItem(`chatMD.last`, this.txt)
      }
    }
  }
}
</script>

<style>

.textArea {
  overflow-x: scroll;
}

.tabs__items {
  overflow: scroll;
  position: relative;
  height: calc(100vh - 250px);
}

.hero {
  min-height: calc(100vh - 38px);
  /* background-color: #333; */
  width: 100%;
  /* Position and center the image to scale nicely on all screens */
  /* background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative; */
}

.textField {
  /* height: 100vh ; */
  height: 100% !important;
}

.bot-container {
  height: auto;
  width: 80%;
  overflow-y: auto;
  margin: 0 auto;
  padding: 1em 0;
}
</style>