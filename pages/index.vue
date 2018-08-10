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

.msg {
  margin: 10px 0;
  min-height: 20px;
}

.msg:after {
  display: block;
  content: "";
  clear: both;
}

.msg-content {
  margin: 10px 0;
  background-color: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  color: #4a4a4a;
  border-radius: 4px;
  font-size: 18px;
  padding: 7px 13px;
  display: inline-block;
  width: auto;
  max-width: 85%;
}

.msg-content.human {
  background-color: #ffd73c;
  color: #111;
  float: right;
}

.msg-quick-replies {
  text-align: center;
}

.quick-replies-btn {
  outline: none;
  font-size: 18px;
  border-radius: 4px;
  background-color: #fcedb5;
  color: #333;
  padding: 7px 15px;
  margin: 5px;
  box-shadow: 2px 3px 4px 0 rgba(0, 0, 0, 0.25);
  border: 0;
}

.quick-replies-btn.selected {
  background-color: #ffd73c;
}

.callFlow {
  margin-top: 15px;
  text-align: center;
}
</style>