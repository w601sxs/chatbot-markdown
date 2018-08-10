export const state = () => ({
  txt: ''
})

export const getters = {
  getTxt: state => () => {
    return state.txt
  }
}

export const mutations = {
  'SET_MARKDOWN' (state, txt) {
    if (txt) {
      state.txt = txt
      if (process.SERVER_BUILD) {
      }
    }
  }
}
