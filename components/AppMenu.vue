<template>
  <div>
    <!-- Desktop Top Menu -->
    <v-toolbar id="top-nav" flat dense color="grey lighten-5">
        <v-spacer></v-spacer>
      <v-toolbar-items v-for="link in links" :key="link.text">
        <v-btn flat :value="link.value"
         nuxt   :to="link.route" class="menu-text">
         {{ link.text }}
        </v-btn>
      </v-toolbar-items>
        <v-spacer></v-spacer>
    </v-toolbar>

    <!-- Mobile bottom menu -->
    <v-bottom-nav id="btm-nav" fixed :value="true" :active.sync="activeTab" color="white">
      <div v-for="link in links" :key="link.value">
        <v-btn flat :value="link.value" nuxt :to="link.route" exact >
          <span>{{ link.text }}</span>
          <v-icon>{{ link.icon }}</v-icon>
        </v-btn>
      </div>
    </v-bottom-nav>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeTab: 'flow',
      links: [
        { text: 'Flow Map', value: 'flow', icon: 'home', route: '/' },
        { text: 'Markdown', value: 'markdown', icon: 'favorite', route: '/markdown' },
        { text: 'Chat Demo', value: 'chat', icon: 'person', route: '/chat' },
        { text: 'JSON', value: 'json', icon: 'person', route: '/json' }
      ]
    }
  }
}
</script>

<style>
.bottom-nav .btn--active {
  color: #F57F17;
}

.menu-text {
  font-weight: 800;
  color: #333;
}

@media screen and (max-width: 565px) {
  #top-nav {
    display: none;
  }
}

@media screen and (min-width: 566px) {
  #btm-nav { 
    display: none;
  }
  #top-nav {
    display: block;
    transition: opacity 1s ease-out;
  }
}
</style>
