import Vue from 'vue'

Vue.filter('prettyJson', function (json) {
  return JSON.stringify(json, null, 2)
})
