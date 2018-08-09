<template>
  <v-app>
    <v-layout column justify-center align-center>
      <v-flex xs12 text-xs-center>
        <div class="display-1 appTitle mb-2">Chatbot Markdown</div>
        <div class="subheading">For companies and developers to prototype chatbot faster.</div>
      </v-flex>
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
    </v-layout>
    <app-menu></app-menu>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    
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
