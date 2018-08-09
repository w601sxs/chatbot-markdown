 <template>
  <v-layout row class="textArea mt-3">
    <v-flex xs12>
      <div v-html="nomnomlMd"></div>  
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      txt: `# 1
- Good morning`
    }
  },
  computed: {
  },
  beforeMount () {
    const query = this.$route.query.q
    if (query) {
      this.txt = decodeURI(query)
      console.log(decodeURI(query))
    } else {
      let lastMarkdown = window.localStorage.getItem('chatMD.last')
      if (lastMarkdown && lastMarkdown !== '' && this.txt !== '') {
        this.txt = lastMarkdown
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

</style>