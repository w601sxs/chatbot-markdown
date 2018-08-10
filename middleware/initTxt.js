export default async function ({ store, route, state }) {
  const query = route.query.q
  if (store.state.txt === '') {
    if (query) {
      store.commit('SET_MARKDOWN', decodeURI(query))
    } else {
      if (process.SERVER_BUILD) {
        let lastMarkdown = window.localStorage.getItem('chatMD.last')
        if (lastMarkdown && lastMarkdown !== '') {
          store.commit('SET_MARKDOWN', lastMarkdown)
        } else {
          const def = `# 1
    - Good morning
    - Ummm.... hello? 
    [Fine]: 2
    [Bad :(]: 3*
    
    # 2
    -- I'm fine, thanks!`
          store.commit('SET_MARKDOWN', def)
        }
      }
    }
  }
}
