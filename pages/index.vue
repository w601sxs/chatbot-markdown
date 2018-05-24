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
        <v-layout row class="textArea">
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
      </v-container>
    </section>
  </div>    
</template>

<script>
function formatMarkdown (str) {
  // link []()
  // find between [ and ) to replace with href HTML
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

export default {
  data () {
    return {
      convos: {},
      txt: `# 1
- Good morning
- Ummm.... hello? 
[Fine]: 2
[Bad :(]: 3*

# 2
-- I'm fine, thanks!

# 3
- Great! Here's a song for you: [link] (https://www.youtube.com/watch?v=OdhTfdG3FHI)
- Cheers!
- ![hedgehog](https://media.boingboing.net/wp-content/uploads/2017/08/hedgie.gif)`
    }
  },
  computed: {
    textHtml () {
      let convos = {}
      let lines = this.txt.split(/\n|\r/g)

      let currentThread = ''

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()
        const firstChar = line[0]

        // # for new thread
        if (firstChar === '#') {
          currentThread = line.match(/\d+/g)[0]
          convos[currentThread] = []
        }

        let thread = convos[currentThread]
        let lastConvo = thread[thread.length - 1]

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
          // if lastConvo is a 'quick reply', add to it
          if (lastConvo.type === 'quick replies') {
            lastConvo.replies.push(
              {
                say: split[0],
                payload: split[1],
                selected: selected
              }
            )
          } else {
            thread.push(
              {
                'type': 'quick replies',
                'replies': [
                  {
                    say: split[0],
                    payload: split[1],
                    selected: selected
                  }
                ]
              }
            )
          }
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

      // build the HTML

      let chatHtml = ``

      // sort threads ascending
      const threads = Object.keys(convos).map(Number).sort()
      let goToThread = ''
      // for each thread...
      for (let i = 0; i < threads.length; i++) {
        const flows = convos[threads[i]]

        // for each conversation in thread...
        for (let j = 0; j < flows.length; j++) {
          const flow = flows[j]

          if (goToThread !== '') {
            if (threads[i] !== goToThread) {
              continue
            } else {
              goToThread = ''
            }
          }

          if (flow.type === 'quick replies') {
            chatHtml += `<div class="msg-quick-replies">`
            // loop for each quick reply
            for (let r = 0; r < flow.replies.length; r++) {
              const reply = flow.replies[r]
              chatHtml += `<button type="button" class="quick-replies-btn${reply.selected ? ' selected' : ''}">${reply.say}</button>`

              // go to thread
              if (reply.selected) {
                goToThread = reply.payload
              }
            }
          } else {
            if (flow.from === 'bot') {
              chatHtml += `<div class="msg"><div class="msg-content bot">${formatMarkdown(flow.say)}</div></div>`
            } else {
              chatHtml += `<div class="msg"><div class="msg-content human">${formatMarkdown(flow.say)}</div></div>`
            }
          }
        }
      }
      chatHtml += ``
      this.convos = convos
      return chatHtml
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
