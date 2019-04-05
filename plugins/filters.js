import Vue from 'vue'

Vue.filter('prettyJson', function (json) {
  return JSON.stringify(json, null, 2)
})

Vue.filter('preserveLineBreaks', function (val) {
  if (val) {
    return val.replace(/\n/g, '\n\n')
  }
})
