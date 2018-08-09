<template>
  <v-app>
    <v-layout column>
      <v-flex xs12 text-xs-center>
        <div class="display-1 appTitle my-3">Chatbot Markdown</div>
        <div class="subheading">For companies and developers to prototype chatbot faster.</div>
      </v-flex>
      
      <!-- Title -->
      
      <a href="https://cupbots.com" class="headerLink mt-2">
        <v-flex xs12 py-0 text-xs-center>
          A project by
          <span>
          Cupbots
          <v-avatar size="25px">
            <img src="~/static/site-icon.png" alt="Cupbots">
          </v-avatar>
          </span>
        </v-flex>
      </a>

      <!-- Menu -->
      
      <app-menu></app-menu>
      <v-flex xs12 class="text-xs-center">
        <v-btn 
        flat 
        class="yellow darken-2" small
        v-clipboard:copy="`https://markdown.cupbots.com/?q=${encodeURIComponent(this.$store.state.txt)}`"
        v-clipboard:success="onCopy"
        v-clipboard:error="onError">
          Get sharable link
        </v-btn>
      </v-flex>

      <v-content>
        <v-container fluid>
          <nuxt />
        </v-container>
      </v-content>
    </v-layout>
    
    <v-footer>
      <v-layout row wrap justify-center>
        <v-flex xs12 py-0 text-xs-center>
          <div>
            <a href="https://cupbots.com" class="headerLink">
            &copy; {{ (new Date()).getFullYear() }} Cupbots
            </a>
          </div>
        </v-flex>
      </v-layout>
    </v-footer>
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
        clipped: false,
        drawer: true,
        fixed: false,
        items: [
          { icon: 'apps', title: 'Welcome', to: '/' },
          { icon: 'bubble_chart', title: 'Inspire', to: '/inspire' }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Vuetify.js'
      }
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
      if (query) {
        this.$store.commit(decodeURI(query))
      } else {
        let lastMarkdown = window.localStorage.getItem('chatMD.last')
        if (lastMarkdown && lastMarkdown !== '' && this.txt !== '') {
          this.$store.commit(lastMarkdown)
        }
      }
    }
  }
</script>

<style>

.appTitle {
  font-weight: 700;
}

.main-container {
  height: 100%;
}

.headerLink {
 color: #555; 
 text-decoration: none; 
 font-style: italic; 
}
</style>
