<template>
  <v-app>
    <v-layout column>
      <v-content>
        <v-container fluid class="pa-0 ma-0">
          <nuxt />
        </v-container>
      </v-content>
    </v-layout>

  </v-app>
</template>

<script>
  import AppMenu from '~/components/AppMenu.vue'

  export default {
    components: {
      appMenu: AppMenu
    },
    data () {
      return {
      }
    },
    computed: {
    },
    methods: {
      onCopy: (e) => {
        alert('URL copied!')
      },
      onError: (e) => {
        alert('Failed to copy URL')
      }
    },
    beforeMount () {
      const query = this.$route.query.q
      console.log(query)
      if (this.$store.state.txt === '') {
        if (query) {
          this.$store.commit('SET_MARKDOWN', decodeURI(query))
        } else {
          let lastMarkdown = window.localStorage.getItem('chatMD.last')
          if (lastMarkdown && lastMarkdown !== '') {
            this.$store.commit('SET_MARKDOWN', lastMarkdown)
          } else {
            const def = `# 1
  - Good morning
  - Ummm.... hello? 
  [Fine]: 2
  [Bad :(]: 3*
  
  # 2
  -- I'm fine, thanks!`
            this.$store.commit('SET_MARKDOWN', def)
          }
        }
      }
    }
  }
</script>
