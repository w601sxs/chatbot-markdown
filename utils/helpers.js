// import nomnoml from 'nomnoml'

// convert hh:mm:ss to seconds
exports.convertToSeconds = (time) => {
  if (time) {
    let a = time.split(':')
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
  } else {
    return 0
  }
}

// prettify seconds (e.g. 180 to 3m)
exports.prettifySec = (time) => {
  const res = new Date(time * 1000).toISOString().substr(11, 12)
  const arr = res.split(':')
  const hh = arr[0] === '00' ? '' : `${Number(arr[0])}h `
  const mm = arr[1] === '00' ? '' : `${Number(arr[1])}m `
  let ss = `${arr[2].split('.')[0]}s`
  return `${hh}${mm}${ss}`
}

// time since
exports.timeSince = (date) => {
  var seconds = Math.floor((new Date() - date) / 1000)
  var interval = Math.floor(seconds / 31536000)

  // if (interval > 1) {
  //   return interval + ' years'
  // }
  // interval = Math.floor(seconds / 2592000)
  // if (interval > 1) {
  //   return interval + ' months'
  // }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    if (interval <= 3) {
      return interval + ' days ago'
    } else {
      return date.toDateString().slice(4, 15)
    }
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval + ' hours ago'
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval + ' mins ago'
  }
  if (seconds) {
    return Math.floor(seconds) + ' secs ago'
  } else {
    return '0 secs ago'
  }
}

exports.pickRandom = (array) => array[Math.floor(Math.random() * array.length)]

exports.validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

// creates an array of flow which contains: thread > convo
// [{ thread: 1, convo: [{ say: '', type: '', 'from: ''}, ...]}, { thread: 2, ...}]
exports.markdownToJson = (markdown) => {
  let finalJson = []
  let lines = markdown.split(/\n|\r/g)
  let currentThread
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const firstChar = line[0]
    const secondChar = line[1]
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
        let payload
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

        // change previous convo to quick reply
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
          selected: selected
        })
      }
    }
  }
  // console.log('>>> finalJson: ', finalJson)
  return finalJson
}

exports.formatMarkdown = (convoObj) => {
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

exports.jsonToNom = (js) => {
  let md = `
  #fill: #fff; #fdf6e3
  #lineWidth: 2
  #fillArrows: true
  #zoom: 0.8
  #.quickreply: fill=#fcedb5 visual=roundrect
  #.openended: fill=#fcedb5 visual=input
  
  `
  // for each thread in flow
  for (let i = 0; i < js.length; i++) {
    let thread = js[i]
    let key = thread['thread']

    md += `\n[${key}\n]`
    // for each convo in thread
    for (let j = 0; j < thread.convos.length; j++) {
      let convo = thread.convos[j]
      let prevConvo = thread.convos[j - 1]
      // if there's text after quick replies, skip as there's no way to reach it
      if (prevConvo && prevConvo.type.includes('quick replies')) { } else {
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
              md += `\n[${title}] -> [${reply.payload}]\n`
            }
          }
        } else {
          if (convo.say && convo.from === 'bot') {
            // remove ] at the end of the string
            md = md.slice(0, -1) + `| ` + `${convo.say}\n]`
          }
        }
      }
    }
    md += `\n`
  }
  // console.log('>> md: ', md)
  return md
}

exports.jsonToHTML = (txt) => {
  const flow = this.markdownToJson(txt)
  let chatHtml = ``
  // sort threads ascending
  const threadsArr = flow.map(item => item.thread).sort()
  let goToThread = ''
  // for skipping thread if one quick reply is selected
  let threadsToSkip = []

  // for each thread ...
  for (let i = 0; i < threadsArr.length; i++) {
    console.log('threadsArr[i]: ', threadsArr[i])
    const currentThreadName = threadsArr[i] ? threadsArr[i].toString() : ''
    // find index of json in array
    let threadIdx = flow.findIndex((item, i) => {
      return item.thread.toString() === currentThreadName
    })
    const allConvos = flow[threadIdx].convos

    // for each conversation in thread...
    for (let j = 0; j < allConvos.length; j++) {
      const convo = allConvos[j]
      const prevConvo = allConvos[j - 1]

      // skip all conversation after quick reply because it's impossible to reach it
      if (prevConvo && prevConvo.type.includes('quick replies')) { } else {
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
              chatHtml += `<div class="msg"><div class="msg-content bot">${this.formatMarkdown(convo)}</div></div>`
            }
            chatHtml += `<div class="msg-quick-replies">`
            // loop for each quick reply
            for (let r = 0; r < convo.replies.length; r++) {
              const reply = convo.replies[r]
              // skip open ended markdown [] by checking if reply.title is empty
              if (reply.title && reply.title !== '') {
                chatHtml += `<button type="button" class="quick-replies-btn${reply.selected ? ' selected' : ''}">${reply.title}</button>`
                // go to thread and skip the non-selected threads by adding them to `threadsToSkip`
              }
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
              chatHtml += `<div class="msg"><div class="msg-content bot">${this.formatMarkdown(convo)}</div></div>`
            } else {
              chatHtml += `<div class="msg"><div class="msg-content human">${this.formatMarkdown(convo)}</div></div>`
            }
          }
        }
      }
    }
  }
  chatHtml += ``
  return chatHtml
}

exports.nomnomlMd = (txt) => {
  let json = this.markdownToJson(txt)

  // prevent error if json is blank
  if (json && json.length !== 0) {
    try {
      let nom = this.jsonToNom(json)
      if (nom && nom.trim() !== '' && nom !== '[]') {
        // return nomnoml.renderSvg(nom)
      }
    } catch (err) {
      console.log(err)
      return `Error: ${err}`
    }
  } else {
    return ''
  }
}
