 <template>
  <div class="main-container">
    <section class="hero">
      <v-container fluid>
        <v-layout column justify-center align-center>
          <v-flex xs12>
            <div class="display-3 appTitle">Chatbot Markdown</div>
            <div class="title">For companies and developers to prototype chatbot faster.</div>
          </v-flex>
        </v-layout>
        <v-layout row class="textArea mt-3">
          <v-flex xs12>
            <v-tabs
            v-model="activeTab"
            slider-color="yellow darken-2"
            centered
            >
              <v-tab ripple href="#tab-chat">
                Chat Demo
              </v-tab>

              <v-tab ripple href="#tab-map">
                Flow Map
              </v-tab>
              
              <v-tab ripple href="#tab-json">
                JSON
              </v-tab>

              <v-tab-item id="tab-map">
                <div v-html="nomnomlMd"></div>
              </v-tab-item>

              <v-tab-item id="tab-chat">
                <v-layout row>
                  <v-flex xs12 sm6>
                    <v-text-field
                      class="textField"
                      name="input-1"
                      rows="10"
                      autofocus
                      textarea
                      v-model="txt"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <div class="bot-container">
                      <div class="bot-msg-container" v-html="textHtml"></div>
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

function markdownToJson (markdown) {
  console.log('RUNNING MARKDOWN TO JSON')
  let convos = {}
  let lines = markdown.split(/\n|\r/g)
  let currentThread = ''
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const firstChar = line[0]
    const secondChar = line[1]
    // # for new thread
    if (firstChar === '#') {
      currentThread = line.match(/\S+/g)
      if (currentThread[1]) {
        currentThread = currentThread[1]
        convos[currentThread] = []
      }
    }
    let thread = convos[currentThread]
    thread = thread || []
    let lastConvo = thread[thread.length - 1]
    // console.log('thread: ', thread)
    // console.log('lastConvo: ', lastConvo)

    if (convos[currentThread]) {
      // [ for quick replies
      if (firstChar === '[') {
        // payload number is after ':'
        // split into [text, payload]
        const idx = line.lastIndexOf(':')

        // if no ':', there's no payload
        let split
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

        // * for selected quick reply
        const selected = split[1].slice(-1) === '*'
        // add quick replies to previous conversation
        if (lastConvo) {
          if (lastConvo.type && lastConvo.type === 'text') {
            if (secondChar === ']') {
              lastConvo.type = 'ask quick replies'
            } else {
              lastConvo.type = 'quick replies'
            }
            lastConvo.replies = []
          }
          if (lastConvo.replies) {
            lastConvo.replies.push({
              title: split[0],
              payload: split[1],
              selected: selected
            })
          }
        }
      }

      // - for bot
      // -- for user reply (only for simulation)
      if (firstChar === '-') {
        // bot
        if (line[1] === ' ') {
          convos[currentThread].push({
            'say': line.substring(2),
            'type': 'text',
            'from': 'bot'
          })
        }
        // human
        if (line[1] === '-' & line[2] === ' ') {
          convos[currentThread].push({
            'say': line.substring(3),
            'type': 'text',
            'from': 'user'
          })
        }
      }

      // space followed by a dash is a multiple selection list
      if (line && /^\s+-/.test(line)) {
        let ls = line.match(/^\s*-(.*)/)[1].trim()
        if (lastConvo) {
          if (lastConvo.type && lastConvo.type === 'text') {
            lastConvo.type = 'list multiple'
            lastConvo.list_multiple = []
          }
          if (lastConvo.list_multiple) {
            lastConvo.list_multiple.push({
              title: ls
            })
          }
        }
      }
    }
  }
  // fs.writeFile('convos.json', JSON.stringify(convos), function (err) {
  //   if (err) throw err;
  // })
  return convos
}

function formatMarkdown (str) {
  // link []()
  // find between [ and ) to replace with href HTML
  if (str) {
    let foundLink = str.match(/\[(.*?)\)/i)
    foundLink = foundLink ? foundLink[0] : ''

    // images ![]()
    let foundImage = str.match(/!\[(.*?)\)/i)
    foundImage = foundImage ? foundImage[0] : ''

    if (foundLink !== '' & foundImage === '') {
      let txt = str.match(/\[(.*?)\]/i)
      txt = txt ? txt[1] : ''

      let link = str.match(/\((.*?)\)/i)
      link = link ? link[1] : ''

      let formattedLink = `<a href="${link}">${txt}</a>`
      str = str.replace(foundLink, formattedLink)
    }

    if (foundImage !== '') {
      let txt = str.match(/\[(.*?)\]/i)
      txt = txt ? txt[1] : ''

      let link = str.match(/\((.*?)\)/i)
      link = link ? link[1] : ''

      let formattedLink = `<img src="${link}" alt="${txt}">`
      str = str.replace(foundImage, formattedLink)
    }
    return str
  }
}

function jsonToNom (js) {
  let keys = Object.keys(js)
  let md = ``

  // for each thread in flow
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    let thread = js[key][0]
    if (thread) {
      if (!thread.say || thread.say.length !== 0) {
        md += `[${key} | ${thread.say}]\n`
      }
    }

    // create quick replies with payload
    if (thread && thread.type.includes('quick replies')) {
      for (let r = 0; r < thread.replies.length; r++) {
        let reply = thread.replies[r]
        let title = `${key}: ${reply.title}`
        let diagType = 'state'

        // open ended question
        if (reply.title === '') {
          diagType = 'input'
          title = `${key}: User answer`
        }

        // msg -> quick replies
        md += `[${key}] -> [<${diagType}> ${title}]\n`

        // quick replies payload -> thread
        // skip if payload is empty. Causes error in nomnoml
        if (reply.payload && reply.payload !== '' && reply.payload !== '[]') {
          md += `[${title}] -> [${reply.payload}]\n`
        }
      }
    }
    md += `\n`
  }
  return md
}

export default {
  data () {
    return {
      activeTab: 'tab-chat',
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
    textHtml () {
      let convos = {}
      let lines = this.txt.split(/\n|\r/g)

      let currentThread = ''

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()

        const firstChar = line[0]

        // # for new thread
        if (firstChar === '#') {
          currentThread = line.match(/\S+/g)
          if (currentThread[1]) {
            currentThread = currentThread[1]
            convos[currentThread] = []
          }
        }

        let thread = convos[currentThread]
        thread = thread || []
        let lastConvo = thread[thread.length - 1]

        if (convos[currentThread]) {
          // [ for quick replies
          if (firstChar === '[') {
            // payload number is after ':'
            // split into [text, payload]
            const idx = line.lastIndexOf(':')

            // slice to remove first and last square brackets
            const split = [
              line.slice(0, idx).slice(1, -1),
              line.slice(idx + 1).trim()
            ]
            // * for selected quick reply
            const selected = split[1].slice(-1) === '*'
            split[1] = split[1].replace(/\D/g, '')
            // add quick replies to previous conversation
            if (lastConvo.type === 'text') {
              lastConvo.type = 'quick replies'
              lastConvo.replies = []
            }
            lastConvo.replies.push(
              {
                say: split[0],
                payload: split[1],
                selected: selected
              }
            )
          }

          // - for bot
          // -- for user reply (only for simulation)
          if (firstChar === '-') {
            // bot
            if (line[1] === ' ') {
              convos[currentThread].push(
                {
                  'say': line.substring(2),
                  'type': 'text',
                  'from': 'bot'
                }
              )
            }
            // human
            if (line[1] === '-' & line[2] === ' ') {
              convos[currentThread].push(
                {
                  'say': line.substring(3),
                  'type': 'text',
                  'from': 'user'
                }
              )
            }
          }
        }
      }

      // build the HTML

      let chatHtml = ``

      // sort threads ascending
      let threads = Object.keys(convos).sort()
      // move 'default' thread to the front
      if (threads.includes('default')) {
        threads = threads.filter(item => item !== 'default')
        threads.unshift('default')
      }

      let goToThread = ''
      // for skipping thread if one quick reply is selected
      let threadsToSkip = []
      // for each thread...
      for (let i = 0; i < threads.length; i++) {
        const flows = convos[threads[i]]

        // for each conversation in thread...
        for (let j = 0; j < flows.length; j++) {
          let flow = flows[j]

          if (goToThread !== '') {
            if (threads[i].toString() !== goToThread) {
              continue
            } else {
              goToThread = ''
            }
          }

          if (!threadsToSkip.includes(threads[i].toString())) {
            if (flow.type === 'quick replies') {
              chatHtml += `<div class="msg"><div class="msg-content bot">${formatMarkdown(flow.say)}</div></div>`
              chatHtml += `<div class="msg-quick-replies">`
              // loop for each quick reply
              for (let r = 0; r < flow.replies.length; r++) {
                const reply = flow.replies[r]
                chatHtml += `<button type="button" class="quick-replies-btn${reply.selected ? ' selected' : ''}">${reply.say}</button>`

                // go to thread
                if (reply.selected) {
                  goToThread = reply.payload
                } else {
                  threadsToSkip.push(reply.payload)
                }
              }
              chatHtml += `</div>`
            } else {
              if (flow.from === 'bot') {
                chatHtml += `<div class="msg"><div class="msg-content bot">${formatMarkdown(flow.say)}</div></div>`
              } else {
                chatHtml += `<div class="msg"><div class="msg-content human">${formatMarkdown(flow.say)}</div></div>`
              }
            }
          }
        }
      }
      chatHtml += ``
      this.convos = convos
      return chatHtml
    },
    nomnomlMd () {
      let nom = jsonToNom(markdownToJson(this.txt))
      if (nom && nom.trim() !== '' && nom !== '[]') {
        // console.log(nomnoml)
        return nomnoml.renderSvg(nom)
      } else {
        return ''
      }
    }
  },
  mounted () {
    let lastMarkdown = window.localStorage.getItem('chatMD.last')
    if (lastMarkdown & lastMarkdown !== '' & this.txt !== '') {
      this.txt = lastMarkdown
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

.inputArea {
  /* height: 100vh ; */
  height: 100%;
}

.bot-container {
  height: auto;
  width: 500px;
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
  margin: 0 5px 0 5px;
  box-shadow: 2px 3px 4px 0 rgba(0, 0, 0, 0.25);
  border: 0;
}

.quick-replies-btn.selected {
  background-color: #ffd73c;
}
</style>