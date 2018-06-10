<template>
  <v-app>
    <v-content>
      <nuxt />
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
  export default {
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

.main-container {
  height: 100%;
}

.headerLink {
 color: #555; 
 text-decoration: none; 
 font-style: italic; 
}
</style>
