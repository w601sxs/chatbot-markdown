// import nomnoml from 'nomnoml'

// convert hh:mm:ss to seconds
export const convertToSeconds = (time) => {
  if (time) {
    let a = time.split(':')
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
  } else {
    return 0
  }
}

// prettify seconds (e.g. 180 to 3m)
export const prettifySec = (time) => {
  const res = new Date(time * 1000).toISOString().substr(11, 12)
  const arr = res.split(':')
  const hh = arr[0] === '00' ? '' : `${Number(arr[0])}h `
  const mm = arr[1] === '00' ? '' : `${Number(arr[1])}m `
  let ss = `${arr[2].split('.')[0]}s`
  return `${hh}${mm}${ss}`
}

// time since
export const timeSince = (date) => {
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

export const pickRandom = (array) => array[Math.floor(Math.random() * array.length)]

export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

// TODO: receipt type
// creates an array of flow which contains: thread > convo
// [{ thread: 1, convo: [{ say: '', type: '', 'from: ''}, ...]}, { thread: 2, ...}]
export const markdownToJson = (markdown) => {
  const extensionLists = {
    video: ['m4v', 'avi', 'mpg', 'mp4', 'webm'],
    image: ['jpg', 'gif', 'bmp', 'png'],
    audio: ['mp3', 'wav', '3gp', 'aac', 'wma'],
    file: ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt', 'zip', 'rar']
  }

  // returns the extension type or 'undefined' if not found
  function getExtension (fName) {
    const ext = fName.substr((fName.lastIndexOf('.') + 1))

    for (let i = 0; i < Object.keys(extensionLists).length; i++) {
      let key = Object.keys(extensionLists)[i]
      if (extensionLists[key].includes(ext)) {
        return key
      }
    }
  }

  // takes a string and returns an object of
  // { title, image_url, payload, selected, openingText }
  const splitTextAndPayload = (line, type = 'quick_replies') => {
    // payload number is after ':'
    const idx = line.lastIndexOf(':')
    let txt, url
    let payload, openingText
    // if there's no ':', there's no payload
    if (idx < 0) {
      txt = line.slice(1, -1)
      payload = ''
    } else {
      // if text has image [text](url)
      const hasUrl = line.slice(0, idx).match(/\[|<(.*?)\)/i)
      if (hasUrl) {
        if (type === 'buttons') {
          const txtInAngleBracket = line.match(/<(.*?)>/i)
          txt = txtInAngleBracket ? txtInAngleBracket[1] : ''
        } else {
          const txtInSquareBracket = line.match(/\[(.*?)\]/i)
          txt = txtInSquareBracket ? txtInSquareBracket[1] : ''
        }
        const urlInBracket = line.match(/\((.*?)\)/i)
        url = urlInBracket ? urlInBracket[1] : null
      } else {
        txt = line.slice(0, idx).slice(1, -1)
      }
      // slice to remove first and last square brackets
      payload = line.slice(idx + 1).trim()
    }
    const selected = payload.slice(-1) === '*'
    payload = payload.replace(/\*/g, '')
    let groups = payload.match(/[^: ]+(.*?)/g)
    if (groups) {
      if (groups.length > 0) {
        // join by space and remove {{ }}
        openingText = groups.slice(1).join(' ').slice(2, -2)
      }
    }
    let obj = {
      title: txt,
      payload: payload !== '' ? payload : null,
      selected: selected,
      openingText: openingText
    }
    // check if url is image
    if (url) {
      if (url === '#') {
        obj.type = 'phone_number'
      } else if (getExtension(url) === 'image') {
        obj.image_url = url
      } else {
        obj.type = 'web_url'
        obj.url = url
      }
    }
    return obj
  }

  let finalJson = []
  let lines = markdown.split(/\n|\r/g)
  let currentThread
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    console.log(i)
    console.log(`%c ${line}`, 'color: #ffa500')
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
    // if existing thread
    if (threadIdx >= 0) {
      let threadConvos = finalJson[threadIdx].convos
      let lastConvoInThread = threadConvos[threadConvos.length - 1] // to push quick replies
      // console.log('>> lastConvo: ', lastConvoInThread)
      let lastElementInPayload
      if (lastConvoInThread && lastConvoInThread.payload && lastConvoInThread.payload.elements) {
        let elements = lastConvoInThread.payload.elements
        lastElementInPayload = elements[elements.length - 1]
      }
      // console.log('lastConvoInThread: ', lastConvoInThread)
      // console.log('lastElementInPayload: ', lastElementInPayload)
      // let lastConvo = thread[thread.length - 1]
      // - for bot
      // -- for user reply (only for simulation)
      let say
      let extension
      let type = 'text'
      let from = 'bot'
      if (firstChar === '-') {
        // bot
        if (line[1] === ' ') {
          say = line.substring(2)
          extension = getExtension(say)
        // human
        } else if (line[1] === '-' & line[2] === ' ') {
          say = line.substring(3)
          from = 'user'
        }
        threadConvos.push({
          'say': say,
          'type': extension || type,
          'from': from
        })
      // === for list, generic or receipt
      } else if (line.substr(0, 3) === '===') {
        const typeText = line.match(/^=+(.*?)$/i)[1].trim()

        // === is used to separate items in markdown
        // if we're building a list, we'll have lastElement
        if (lastElementInPayload) {
          lastConvoInThread.payload.elements.push({})
        } else {
          let templateType, topElementStyle

          switch (typeText) {
            case 'list large':
              templateType = 'list'
              topElementStyle = 'large'
              break
            case 'list compact':
              templateType = 'list'
              topElementStyle = 'compact'
              break
            case 'generic':
              templateType = 'generic'
              type = 'generic'
              break
            case 'receipt':
              templateType = 'receipt'
              break
            default:
              break
          }
          console.log('templateType: ', templateType)
          threadConvos.push({
            type: 'template',
            payload: {
              template_type: templateType,
              top_element_style: topElementStyle,
              elements: [{}]
            }
          })
        }
      // <>: buttons
      } else if (firstChar === '<') {
        let json = splitTextAndPayload(line, 'buttons')
        // console.log(json)
        // if has lastElement, we're building a list. So don't need to change the lastConvo type
        if (lastElementInPayload) {
          if ('title' in lastElementInPayload) {
            if (!lastElementInPayload.buttons) {
              lastElementInPayload.buttons = []
            }
            // lists have default action
            if (json.title === 'default') {
              lastElementInPayload.default_action = json
            } else {
              lastElementInPayload.buttons.push(json)
            }
          } else {
            lastConvoInThread.payload.elements.splice(-1, 1)
            lastConvoInThread.payload.buttons = []
            lastConvoInThread.payload.buttons.push(json)
          }
        } else if (lastConvoInThread) {
          // change previous convo to buttons
          if (lastConvoInThread.type && !['list', 'generic', 'receipt', 'buttons'].includes(lastConvoInThread.type)) {
            lastConvoInThread.type = 'buttons'
            lastConvoInThread.payload = []
          }
          lastConvoInThread.payload.push(json)
        }
      // []: quick replies
      } else if (firstChar === '[') {
        let json = splitTextAndPayload(line)
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
          lastConvoInThread.replies.push(json)
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
      // continue to build the list
      } else if (lastConvoInThread && lastConvoInThread.type === 'template') {
        const regexRes = line.match(/(.*?):(.*?)$/i)
        let key = regexRes[1]
        const value = regexRes[2]

        switch (key) {
          case 'image':
            key = 'image_url'
            break
          default:
            break
        }
        lastElementInPayload[key] = value
      }
    }
  }
  // console.log('>>> finalJson: ', finalJson)
  return finalJson
}

export const formatMarkdown = (convoObj) => {
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

export const jsonToNom = (js) => {
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

export const jsonToHTML = (txt) => {
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

export const nomnomlMd = (txt) => {
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
