<template>
<pre>
  {{ json | prettyJson }}
</pre>
</template>

<script>
import { markdownToJson } from '~/utils/helpers'
export default {
  computed: {
    json () {
      let json = markdownToJson(this.$store.state.txt)
      return json
    }
  }
}
</script>
