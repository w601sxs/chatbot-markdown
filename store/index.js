export const state = () => ({
  txt: '',
  txt2: '',
  txt3: ''
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
    }
  },
  'SET_MARKDOWN2' (state, txt) {
    if (txt) {
      state.txt2 = txt
    }
  },
  'SET_MARKDOWN3' (state, txt) {
    if (txt) {
      state.txt3 = txt
    }
  }
}
