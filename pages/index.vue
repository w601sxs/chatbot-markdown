 <template>
  <v-layout row class="textArea mt-3">
    <v-flex xs12>
      <div v-html="nomnomlMd"></div>  
    </v-flex>
  </v-layout>
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
      txt: `# 1
- Good morning`
    }
  },
  computed: {
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