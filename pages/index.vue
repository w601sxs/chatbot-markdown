 <template>
  <div class="main-container">
    <section class="hero">
      <v-container fluid>
        <v-layout column justify-center align-center>
          <v-flex xs12 text-xs-center>
            <div class="display-2 appTitle mb-2">Chatbot Markdown</div>
            <div class="title">For companies and developers to prototype chatbot faster.</div>
          </v-flex>
          <a href="https://cupbots.com" class="headerLink mt-2">
          <v-flex xs12 py-0 text-xs-center>
            Built by Shawn at 
            <span>
            Cupbots
            <v-avatar size="25px">
              <img src="~/static/site-icon.png" alt="Cupbots">
            </v-avatar>
            </span>
          </v-flex>
          </a>
        </v-layout>
        <v-layout row class="textArea mt-3">
          <v-flex xs12>
            <v-tabs
            v-model="activeTab"
            slider-color="yellow darken-2"
            centered
            >

              <v-tab nuxt ripple href="#tab-map">
                Flow Map
              </v-tab>
              
              <v-tab nuxt ripple href="#tab-chat">
                Markdown
              </v-tab>

              <v-tab nuxt ripple href="#tab-json">
                JSON
              </v-tab>
              <v-spacer></v-spacer>
              <v-btn 
              flat 
              class="yellow darken-2" small
              v-clipboard:copy="`https://markdown.cupbots.com/?q=${encodeURIComponent(this.txt)}`"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError">
                Get sharable link
              </v-btn>

              <v-tab-item id="tab-map">
                <v-layout row>
                  <!-- <v-flex xs12 sm5>
                    <v-text-field
                      class="textField"
                      name="input-1"
                      rows="10"
                      autofocus
                      textarea
                      v-model="txt"
                    ></v-text-field>
                  </v-flex> -->
                  <v-flex xs12>
                    <div v-html="nomnomlMd"></div>  
                  </v-flex>
                </v-layout>
              </v-tab-item>

              <v-tab-item id="tab-chat">
                <v-layout row>
                  <v-flex xs12 sm5>
                    <v-text-field
                      class="textField"
                      name="input-1"
                      rows="10"
                      autofocus
                      textarea
                      v-model="txt"
                    ></v-text-field>
                  </v-flex>
                  <v-spacer></v-spacer>
                  <v-flex xs12 sm6>
                    <div class="bot-container">
                      <div class="bot-msg-container" v-html="jsonToHTML"></div>
                    </div>
                  </v-flex>
                </v-layout>
              </v-tab-item>

              <v-tab-item id="tab-json">
                <pre>{{ mdJson }}</pre>
              </v-tab-item>
            </v-tabs>
          </v-flex>
        </v-layout>
        <!-- {{ convos }} -->
      </v-container>
    </section>
  </div>    
</template>


<script>
import nomnoml from 'nomnoml'

// creates an array of flow which contains: thread > convo
// [{ thread: 1, convo: [{ say: '', type: '', 'from: ''}, ...]}, { thread: 2, ...}]
let markdownToJson = (markdown) => {
  let finalJson = []
  let lines = markdown.split(/\n|\r/g)
  let currentThread
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const firstChar = line[0]
    const secondChar = line[1]
    const lastChar = line[line.length - 1]
    // # for new thread
    if (firstChar === '#') {
      currentThread = line.match(/\S+/g)
      if (currentThread[1]) {
        currentThread = currentThread[1]
      }
    }

    // find index of json in array
    let threadIdx = finalJson.findIndex((item, i) => {
      return item.thread === currentThread
    })

    // if it's a new thread..
    if (threadIdx < 0) {
      finalJson.push({
        thread: currentThread,
        convos: []
      })
      threadIdx = finalJson.length - 1
    }

    if (threadIdx >= 0) {
      let threadConvos = finalJson[threadIdx].convos
      let lastConvoInThread = threadConvos[threadConvos.length - 1] // to push quick replies
      // let lastConvo = thread[thread.length - 1]
      // - for bot
      // -- for user reply (only for simulation)
      let say
      let type = 'text'
      let from = 'bot'

      if (firstChar === '-') {
        // link []()
        let foundLink = line.match(/\[(.*?)\)/i)
        // images ![]()
        let foundImage = line.match(/!\[(.*?)\)/i)

        // if it's pure text...
        if (!foundImage && !foundLink) {
          // bot
          if (line[1] === ' ') {
            say = line.substring(2)
            // human
          } else if (line[1] === '-' & line[2] === ' ') {
            say = line.substring(3)
            from = 'user'
          }
          threadConvos.push({
            'say': say,
            'type': type,
            'from': from
          })
        } else {
          let txt = line.match(/\[(.*?)\]/i)
          txt = txt ? txt[1] : ''

          let link = line.match(/\((.*?)\)/i)
          link = link ? link[1] : ''

          threadConvos.push({
            'say': txt,
            'url': link,
            'type': foundImage ? 'image' : 'url',
            'from': from
          })
        }
        // [ : quick replies
      } else if (firstChar === '[') {
        // payload number is after ':'
        // split into [text, payload]
        const idx = line.lastIndexOf(':')
        let split
        let payload, openingText
        // if there's no ':', there's no payload
        if (idx >= 0) {
          // slice to remove first and last square brackets
          split = [
            line.slice(0, idx).slice(1, -1),
            line.slice(idx + 1).trim()
          ]
        } else {
          split = [
            line.slice(1, -1),
            ''
          ]
        }
        payload = split[1]
        const selected = payload.slice(-1) === '*'
        payload = payload.replace(/\*/g, '')

        let groups = payload.match(/[^: ]+(.*?)/g)

        if (groups) {
          if (groups.length > 0) {
            // join by space and remove {{ }}
            openingText = groups.slice(1).join(' ').slice(2, -2)
          }
        }

        // change previous convo to quick reply
        if (lastConvoInThread) {
          if (lastConvoInThread.type && !lastConvoInThread.type.includes('quick replies')) {
            // [] : open ended question with quick replies
            if (secondChar === ']') {
              lastConvoInThread.type = 'ask quick replies'
            } else {
              lastConvoInThread.type = 'quick replies'
            }
            lastConvoInThread.replies = []
          }

          lastConvoInThread.replies.push({
            title: split[0],
            payload: payload,
            selected: selected,
            openingText: openingText
          })
        }
        // {} to call another flow
      } else if (firstChar === '{' && lastChar === '}') {
        finalJson[threadIdx].gotoFlow = line.match(/\{(.*?)\}/i)[1]
        // : to go to next thread
      } else if (firstChar === ':') {
        let groups = line.match(/[^: ]+/g)

        if (groups) {
          finalJson[threadIdx].gotoThread = groups[0]
          if (groups.length > 0) {
            finalJson[threadIdx].openingText = groups.slice(1).join(' ').slice(2, -2)
          }
        }
      }
    }
  }
  // console.log('>>> finalJson: ', finalJson)
  return finalJson
}

function formatMarkdown (convoObj) {
  // link []()
  // find between [ and ) to replace with href HTML
  if (convoObj) {
    let html
    let type = convoObj.type
    let txt = convoObj.say

    if (convoObj.url) {
      let link = convoObj.url
      let txt = convoObj.say

      if (type === 'url') {
        html = `<a href="${link}">${txt}</a>`
      } else if (type === 'image') {
        html = `<img src="${link}" alt="${txt}">`
      }
    } else {
      return txt
    }
    return html
  }
}

function jsonToNom (js) {
  let md = `
    #fill: #fff; #fdf6e3
    #lineWidth: 2
    #fillArrows: true
    #spacing: 40
    #padding: 8
    #.quickreply: fill=#fcedb5 visual=roundrect
    #.openended: fill=#fcedb5 visual=input
    #.callflow: fill=#dedede visual=receiver bold
  
  `
  // for each thread
  for (let i = 0; i < js.length; i++) {
    let thread = js[i]
    let key = thread['thread']

    // calls another flow and link back here
    if (thread.gotoFlow) {
      let diagType = 'callflow'
      md += `\n[<${diagType}> ${key}|\n`
      if (thread.gotoFlow && thread.gotoFlow !== key) {
        md += `${thread.gotoFlow}]\n`
      } else {
        md += `]`
      }
      // if (thread.gotoThread) {
      //   md += `  \n[${key}] -> [${thread.gotoThread}]\n`
      // }
    } else {
      md += `\n[${key}\n]`
    }

    // for each convo in thread
    for (let j = 0; j < thread.convos.length; j++) {
      let convo = thread.convos[j]
      // console.log('>> convo: ', convo)
      let prevConvo = thread.convos[j - 1]
      // if there's text after quick replies, skip as there's no way to reach it
      if (prevConvo && prevConvo.type.includes('quick replies')) {
        break
      }
      // normal bot conversation
      if (convo.say && convo.from === 'bot') {
        // remove ] at the end of the string
        md = md.slice(0, -1) + `| ` + `${convo.say}\n]`
      }

      // create quick replies with payload
      if (convo && convo.type.includes('quick replies')) {
        for (let r = 0; r < convo.replies.length; r++) {
          let reply = convo.replies[r]
          let title = `${key}: ${reply.title}`
          let diagType = 'quickreply'

          // open ended question
          if (reply.title === '') {
            diagType = 'openended'
            title = `${key}: User answer`
          }

          // msg -> quick replies
          md += `\n[${key}] -> [<${diagType}> ${title}]\n`

          // quick replies payload -> thread
          // skip if payload is empty. Causes error in nomnoml
          if (reply.payload && reply.payload !== '' && reply.payload !== '[]') {
            // if has openingText, the payload is just the text before {{ }}.
            // the text inside {{ }} is used a opening text for customization
            if (reply.openingText) {
              let groups = reply.payload.match(/[^: ]+/g)
              let payload, openingText
              if (groups) {
                payload = groups[0]
                if (groups.length > 0) {
                  // join by space and remove {{ }}
                  openingText = groups.slice(1).join(' ').slice(2, -2)
                }
              }
              md += `\n[${title}] -- [${openingText}]\n`
              md += `\n[${openingText}] -> [${payload}]\n`
            } else {
              md += `\n[${title}] -> [${reply.payload}]\n`
            }
          }
        }
      }
    }

    if (thread.gotoThread) {
      if (thread.openingText) {
        md += `\n[${key}] -- [${thread.openingText}]\n`
        md += `\n[${thread.openingText}] -> [${thread.gotoThread}]\n`
      } else {
        md = md + `\n[${key}] -> [${thread.gotoThread}]`
      }
    }

    md += `\n`
  }
  // console.log('>> md: ', md)
  return md
}

export default {
  data () {
    return {
      activeTab: 'tab-map',
      copyDialog: true,
      convos: {},
      txt: `# 1
- Good morning
- Ummm.... hello? 
[Fine]: 2
[Bad :(]: 3*

# 2
-- I'm fine, thanks!`
    }
  },
  computed: {
    mdJson () {
      return JSON.stringify(markdownToJson(this.txt), null, 2)
    },
    jsonToHTML () {
      const flow = markdownToJson(this.txt)
      let chatHtml = ``
      // sort threads ascending
      const threadsArr = flow.map(item => item.thread)
      let goToThread = ''
      // for skipping thread if one quick reply is selected
      let threadsToSkip = []

      // for each thread ...
      if (threadsArr) {
        for (let i = 0; i < threadsArr.length; i++) {
          if (threadsArr[i]) {
            const currentThreadName = threadsArr[i].toString()
            // find index of json in array
            let threadIdx = flow.findIndex((item, i) => {
              return item.thread.toString() === currentThreadName
            })
            let currentFlow = flow[threadIdx]
            // calls another flow
            if (currentFlow.gotoFlow) {
              chatHtml += `<div class="callFlow"><em>Execute flow: <u>${currentFlow.gotoFlow}</u></em></div>`
            }
            const allConvos = currentFlow.convos
            // for each conversation in thread...
            for (let j = 0; j < allConvos.length; j++) {
              const convo = allConvos[j]
              const prevConvo = allConvos[j - 1]

              // skip all conversation after quick reply because it's impossible to reach it
              if (prevConvo && prevConvo.type.includes('quick replies')) {
              } else {
                if (goToThread !== '') {
                  if (currentThreadName !== goToThread) {
                    continue
                  } else {
                    goToThread = ''
                  }
                }
                // chatbot demo will only pick out the selected quick reply (with * at the end)
                if (!threadsToSkip.includes(currentThreadName)) {
                  if (convo.type === 'quick replies') {
                    if (convo.say !== '') {
                      chatHtml += `<div class="msg"><div class="msg-content bot">${formatMarkdown(convo)}</div></div>`
                    }
                    chatHtml += `<div class="msg-quick-replies">`
                    // loop for each quick reply
                    for (let r = 0; r < convo.replies.length; r++) {
                      const reply = convo.replies[r]
                      // skip open ended markdown [] by checking if reply.title is empty
                      // if (reply.title) {
                      chatHtml += `<button type="button" class="quick-replies-btn${reply.selected ? ' selected' : ''}">${reply.title}</button>`
                      // }

                      // go to thread and skip the non-selected threads by adding them to `threadsToSkip`
                      // if quick reply is selected, go to thread. Skip the other threads.
                      if (reply.selected) {
                        goToThread = reply.payload
                      } else {
                        threadsToSkip.push(reply.payload)
                      }
                    }
                    chatHtml += `</div>`
                  } else {
                    if (convo.from === 'bot') {
                      chatHtml += `<div class="msg"><div class="msg-content bot">${formatMarkdown(convo)}</div></div>`
                    } else {
                      chatHtml += `<div class="msg"><div class="msg-content human">${formatMarkdown(convo)}</div></div>`
                    }
                  }
                }
              }
            }
          }
        }
      }
      chatHtml += ``
      return chatHtml
    },
    nomnomlMd () {
      let json = markdownToJson(this.txt)

      // prevent error if json is blank
      if (json && json.length !== 0) {
        try {
          let nom = jsonToNom(json)
          if (nom && nom.trim() !== '' && nom !== '[]') {
            return nomnoml.renderSvg(nom)
          }
        } catch (err) {
          console.log(err)
          return `Error: ${err}`
        }
      } else {
        return ''
      }
    }
  },
  methods: {
    onCopy: (e) => {
      alert('URL copied!')
    },
    onError: (e) => {
      alert('Failed to copy URL')
    }
  },
  beforeMount () {
    const query = this.$route.query.q
    if (query) {
      this.txt = decodeURI(query)
      console.log(decodeURI(query))
    } else {
      let lastMarkdown = window.localStorage.getItem('chatMD.last')
      if (lastMarkdown && lastMarkdown !== '' && this.txt !== '') {
        this.txt = lastMarkdown
      }
    }
  },
  watch: {
    txt: {
      handler: function () {
        window.localStorage.setItem(`chatMD.last`, this.txt)
      }
    }
  }
}
</script>

<style>

.tabs__items {
  overflow: scroll;
  position: relative;
  height: calc(100vh - 250px);
}

.appTitle {
  font-weight: 700;
}

.hero {
  min-height: calc(100vh - 38px);
  /* background-color: #333; */
  width: 100%;
  /* Position and center the image to scale nicely on all screens */
  /* background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative; */
}

.textField {
  /* height: 100vh ; */
  height: 100% !important;
}

.bot-container {
  height: auto;
  width: 80%;
  overflow-y: auto;
  margin: 0 auto;
  padding: 1em 0;
}

.msg {
  margin: 10px 0;
  min-height: 20px;
}

.msg:after {
  display: block;
  content: "";
  clear: both;
}

.msg-content {
  margin: 10px 0;
  background-color: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  color: #4a4a4a;
  border-radius: 4px;
  font-size: 18px;
  padding: 7px 13px;
  display: inline-block;
  width: auto;
  max-width: 85%;
}

.msg-content.human {
  background-color: #ffd73c;
  color: #111;
  float: right;
}

.msg-quick-replies {
  text-align: center;
}

.quick-replies-btn {
  outline: none;
  font-size: 18px;
  border-radius: 4px;
  background-color: #fcedb5;
  color: #333;
  padding: 7px 15px;
  margin: 5px;
  box-shadow: 2px 3px 4px 0 rgba(0, 0, 0, 0.25);
  border: 0;
}

.quick-replies-btn.selected {
  background-color: #ffd73c;
}

.callFlow {
  margin-top: 15px;
  text-align: center;
}
</style>