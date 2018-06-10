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
                    {{ mdJson }}
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

// creates an array of flow which contains: thread > convo
// [{ thread: 1, convo: [{ say: '', type: '', 'from: ''}, ...]}, { thread: 2, ...}]
function markdownToJson (markdown) {
  // console.log('RUNNING MARKDOWN TO JSON')
  let finalJson = []
  let lines = markdown.split(/\n|\r/g)
  let currentThread
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    // console.log('>>> line: ', line)
    const firstChar = line[0]
    const secondChar = line[1]
    // # for new thread
    if (firstChar === '#') {
      currentThread = line.match(/\S+/g)
      if (currentThread[1]) {
        currentThread = currentThread[1]
        finalJson.push({ thread: currentThread, convos: [] })
      }
    }

    // find index of json in array
    let threadIdx = finalJson.findIndex((item, i) => {
      return item.thread === currentThread
    })

    // console.log('>>> currentThread: ', currentThread)
    // console.log('>> convos: ', convos)
    // console.log('>> threadIdx: ', threadIdx)

    // let thread = convos[currentThread]
    // thread = thread || []
    // console.log('thread: ', thread)
    // console.log('lastConvo: ', lastConvo)

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
      // [ : quick replies
      } else if (firstChar === '[') {
        // payload number is after ':'
        // split into [text, payload]
        const idx = line.lastIndexOf(':')
        let split
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

        const selected = split[1].slice(-1) === '*'

        // change previous convo to quick reply
        if (lastConvoInThread.type && lastConvoInThread.type === 'text') {
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
          payload: split[1],
          selected: selected
        })
      }
    }
  }
  console.log('>>> finalJson: ', finalJson)
  return finalJson
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
  let md = `
  #fill: #fff; #fdf6e3
  #lineWidth: 2
  #fillArrows: true
  #zoom: 0.8
  #.quickreply: fill=#fcedb5 visual=roundrect
  #.openended: fill=#fcedb5
  
  `

  // for each thread in flow
  // console.log('>> js length: ', js.length)
  for (let i = 0; i < js.length; i++) {
    let thread = js[i]
    let key = thread['thread']

    console.log('>> thread: ', thread)

    md += `\n[${key}\n]`
    // for each convo in thread
    for (let j = 0; j < thread.convos.length; j++) {
      let convo = thread.convos[j]
      // console.log('>> convo: ', convo)
      // console.log('j: ', j)
      // console.log('md: ', md)
      // console.log('md slice: ', md.slice(0, -1))

      // remove ] at the end of the string
      md = md.slice(0, -1) + `| ` + `${convo.say}\n]`
      // if (j === thread.length - 1) {
      //   md += `]\n`
      // }

    //   // create quick replies with payload
    //   if (flow && flow.type.includes('quick replies')) {
    //     for (let r = 0; r < flow.replies.length; r++) {
    //       let reply = flow.replies[r]
    //       let title = `${key}: ${reply.title}`
    //       let diagType = 'quickreply'

    //       // open ended question
    //       if (reply.title === '') {
    //         diagType = 'openended'
    //         title = `${key}: User answer`
    //       }

    //       // msg -> quick replies
    //       md += `[${key}] -> [<${diagType}> ${title}]\n`

    //       // quick replies payload -> thread
    //       // skip if payload is empty. Causes error in nomnoml
    //       if (reply.payload && reply.payload !== '' && reply.payload !== '[]') {
    //         md += `[${title}] -> [${reply.payload}]\n`
    //       }
    //     }
    //   }
    }
    md += `\n`
  }
  // check if last character is a ]
  // if (md.slice(-1) !== ']') {
  //   md += ']'
  // }
  console.log('>> md: ', md)
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
      let json = markdownToJson(this.txt)

      // console.log('nom: ', nom)
      // console.log('typeof nom: ', typeof nom)
      // console.log('nom []: ', nom === [])
      // console.log('nom is blank: ', nom === '')

      // prevent error if json is blank
      if (json && json.length !== 0) {
        let nom = jsonToNom(json)
        if (nom && nom.trim() !== '' && nom !== '[]') {
          // console.log(nomnoml)
          return nomnoml.renderSvg(nom)
        }
      } else {
        return ''
      }
    }
  },
  mounted () {
    let lastMarkdown = window.localStorage.getItem('chatMD.last')
    if (lastMarkdown && lastMarkdown !== '' && this.txt !== '') {
      // this.txt = lastMarkdown
      this.txt = `
# 1
- hello!`
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

.inputArea {
  /* height: 100vh ; */
  height: 100%;
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
</style>