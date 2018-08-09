export const state = () => ({
  txt: `# 1
- Good morning
- Ummm.... hello? 
[Fine]: 2
[Bad :(]: 3*

# 2
-- I'm fine, thanks!`
})

export const mutations = {
  'SET_MARKDOWN' (state, txt) {
    state.txt = txt
  }
}
