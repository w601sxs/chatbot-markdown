export const state = () => ({
  txt: '',
  txt2: '',
  txt3: '',
  title1: '',
  subtitle1: '',
  title2: '',
  subtitle2: '',
  title3: '',
  subtitle3: ''
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
  },
  'SET_TITLE1' (state, txt) {
    if (txt) {
      state.title1 = txt
    }
  },
  'SET_TITLE2' (state, txt) {
    if (txt) {
      state.title2 = txt
    }
  },
  'SET_TITLE3' (state, txt) {
    if (txt) {
      state.title3 = txt
    }
  },
  'SET_SUBTITLE1' (state, txt) {
    if (txt) {
      state.subtitle1 = txt
    }
  },
  'SET_SUBTITLE2' (state, txt) {
    if (txt) {
      state.subtitle2 = txt
    }
  },
  'SET_SUBTITLE3' (state, txt) {
    if (txt) {
      state.subtitle3 = txt
    }
  }
}
