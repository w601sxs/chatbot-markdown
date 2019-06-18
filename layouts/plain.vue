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
      if (this.$store.state.txt === '') {
        if (query) {
          this.$store.commit('SET_MARKDOWN', decodeURI(query))
        } else {
          let title1 = window.localStorage.getItem('chatMD.title1')
          if (title1 && title1 !== '') {
            this.$store.commit('SET_TITLE1', title1)
          }
          let title2 = window.localStorage.getItem('chatMD.title2')
          if (title2 && title2 !== '') {
            this.$store.commit('SET_TITLE2', title2)
          }
          let title3 = window.localStorage.getItem('chatMD.title3')
          if (title3 && title3 !== '') {
            this.$store.commit('SET_TITLE3', title3)
          }
          let subtitle1 = window.localStorage.getItem('chatMD.subtitle1')
          if (subtitle1 && subtitle1 !== '') {
            this.$store.commit('SET_SUBTITLE1', subtitle1)
          }
          let subtitle2 = window.localStorage.getItem('chatMD.subtitle2')
          if (subtitle2 && subtitle2 !== '') {
            this.$store.commit('SET_SUBTITLE2', subtitle2)
          }
          let subtitle3 = window.localStorage.getItem('chatMD.subtitle3')
          if (subtitle3 && subtitle3 !== '') {
            this.$store.commit('SET_SUBTITLE3', subtitle3)
          }

          let lastMarkdown2 = window.localStorage.getItem('chatMD.last2')
          if (lastMarkdown2 && lastMarkdown2 !== '') {
            this.$store.commit('SET_MARKDOWN2', lastMarkdown2)
          }

          let lastMarkdown3 = window.localStorage.getItem('chatMD.last3')
          if (lastMarkdown3 && lastMarkdown3 !== '') {
            this.$store.commit('SET_MARKDOWN3', lastMarkdown3)
          }

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
