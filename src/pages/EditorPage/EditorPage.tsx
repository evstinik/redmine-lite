import React, { useEffect, useRef } from 'react'
import * as HyperMD from 'hypermd'
import * as textile from 'textile-js'
import * as toTextile from 'to-textile'
import TurndownService from 'turndown'
import { gfm, tables, strikethrough } from 'turndown-plugin-gfm'

import './EditorPage.css'

const turnDownService = new TurndownService({ headingStyle: 'atx' })
turnDownService.use(gfm)
turnDownService.use(tables)
turnDownService.use(strikethrough)

const showdownConverter = new window.showdown.Converter({})

export const EditorPage: React.FC = () => {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const editor = HyperMD.fromTextArea(ref.current!)
    // subscribe to change event
    editor.on('change', (instance, changeObj) => {
      const markdown = instance.getValue()
      const html = showdownConverter.makeHtml(markdown)
      const textile = toTextile(html)
      console.log('Result: ', textile)
    })
  }, [])

  return (
    <div
      className='editor-page'
      style={{
        width: '100vw',
        height: '100vh'
      }}
    >
      <textarea ref={ref}>{markdown}</textarea>
    </div>
  )
}

const TEXTILE_CONTENT = JSON.parse(
  '"h1. VS Web App\\n\\nThe web app is for promotion of SABOT solution.\\nThe app integrates with new SABOT architecture, see https://redmine.sabo-gmbh.de/projects/sabot/wiki/Architecture\\nCurrently it will allow to control MIWE baking unit.\\n[[Mobile app]] can serve as inspiration currently.\\nStrong security is not yet implemented in SABOT. Suggestion is to use SABO AD, allowing only SABO people to use it.\\n\\nh2. Glossary\\n\\n|_. Term |_. Description |\\n| AS-API | Assistant Service API (part of SABOT solution); An API where VS is connected.|\\n| STT | Speech To Text |\\n| TTS | Text To Speech |\\n| VS | Voice Service (part of SABOT solution); Web app is one of available implementation of VS |\\n\\nh2. Requirements\\n\\nh3. Functional requirements\\n\\n# As a user I want to be able define variables for connected machine.\\n** user shall currently only define equipment number of MIWE unit, e.g. 20222022\\n** init version shall allo to type it in text box field\\n# As a user I want to be able to connect to the machine.\\n** register at AS, call API endpoint over web socket\\n** web keeps connection alive until user disconnect or close the browser (not sure how it works with new feature of browsers that is suspending webs, like google chrome)\\n** you might need to implement reconnect routine\\n# As a user I want to be able to see connection status.\\n** display status of the connection (VS is connected over wss to AS)\\n# As a user I want to be able to disconnect currently connected machine.\\n# As a user I want to be able to activate mic and start speaking.\\n# As a user I want to be able to mute a speaker playing responses from the machine.\\n** add a button to the screen\\n** it shall working as a quick option, so it shall be directly accessible all the time\\n# As a user I want to be able to see history of current conversation\\n** web shall display conversation in chat history, just display, no edit, scrollable, visibly seen who was talking (bot vs user)\\n# As a user I want to be able to display version of the app (semantic versioning preferred)\\n# As a user I want to be able to change language (en, de) as my language preference for VUI.\\n** language is needed mainly as user preference for TTS. STT service is able to get language from speech and SABOT processes it correctly.\\n\\n+Optional+\\n# As a user I want to be able to privacy policy (under About)\\n# As a user I want to be able to display Impressum \\n# As a user I want to webapp remember  my previously used machine ids.\\n# As a user I want to be able to type my input instead of saying it. (chat capabilities)\\n\\nh3. System requirements\\n\\n# Need to run web browsers.\\n** we shall focus only latest version of Chrome, Firefox.\\n# The app shall be deployed automatically over CI.\\n# Is shall be distributed over Docker image\\n# The app will be hosted on multiple environments (Dev | Test).\\n# Any setting changing per environment must be in .env config file\\n# the app needs to be able to access audio in/out through the web browser.\\n# The app shall use STT service, currently Azure service.\\n# The app shall use TTS service, currently Azure service.\\n# The azure credentials shall be managed on server side or received from server side service.\\n** the credential must be secured\\n** Access key for Azure services shall be shared for all users\\n# The app shall be in EN and DE language.\\n** low priority, but it could be easy as there wont be much stuff at the site\\n# The app shall be able to follow SABO company UI & UX design.\\n\\nh2. UI & Design & Wireframes\\n\\nh3. Design\\n\\n* The look & feel of app shall be based on design used for https://www.sabot.ai/\\n** Rudolf shall be able to provide resources\\n** It is app, so it shall be simple clean design\\n** \\"wireframe source\\":https://sabogmbh-my.sharepoint.com/:u:/g/personal/sabo_saboit_de/EQyxOWN0RzhIrG7gT9HaAQ8BQc2c1zFsztUiaeUVDmIxVA?e=KB6JZn\\n\\n!sabot.vs.webapp-wireframes.jpg!\\n\\nh3. Screen map\\n\\n* preferable design is all in one page\\n* header with title, logged username, UI language switch\\n* footer with version and SABO trademark (policy link, impressum link to pdf for example or popup)\\n* Body splits into two tabs\\n## Machine connection and conversation handling\\n*** machine connection (textbox, button connect, status)\\n*** conversation (activate conversation button \\"start\\")\\n*** user preferences (language)\\n*** maybe some instruction, very simple\\n## Conversation history\\n*** latest on the top, scrollable\\n*** visibly seen who said what (align left user, right bot)\\n*** I presume we could use it as well for any important message from system (connection problems)\\n\\nh2. Business processes\\n\\nh3. WebApp loads\\n\\n* An user opens url at browser (sabot-vs-demo.sabo-gmbh.de)\\n* A welcome page loading sequence of web app.\\n** Loads title and trigger auth\\n* A user authenticates (MS account used)\\n** Alternative: User fails to auth: display 403 error\\n** HappyPath: User success to auth: rest of webapp is loaded\\n* focus on textbox to specify machine\\n\\nh3. Connect machine\\n\\n+A case when user wish to connect to the selected machine.+\\n# type a machine id to the textbox\\n# hit the Connect button\\n** System: starts establishing a connection for machine_id typed in textbox\\n** System: changes status of connection at web (connecting -> connected|failed)\\n# Sabot responses with current status of the machine\\n** System: write response to history\\n** system: start saying response\\n\\nh3. User request processing\\n\\n+A case when user speaks a command and it is processed by web app.+\\n# System: machine is connected, status is green\\n# User: click on \\"start\\" button and speaks\\n** Start button changed to STOP button (with animation that is listening)\\n# System: process the speech\\n** gets audio\\n** transcript over STT (STT returns text as it recognize it, especially if the audio is processed as stream, that is preferred way)\\n** send text to AS for processing\\n# System: receives response from AS\\n** gets response as text\\n** convert text to speech and play it (usually over audio file)\\n** when it start speaking, change the status Start button \\"Speaking\\" and block user speech to process at STT\\n** after bot response speech is finished, switch activation button back to STOP and start listening user speech again.\\n# User can speak again or deactivate listening button\\n\\nh3. User gets notification from machine\\n\\n+A case when user receive notification from machine.+\\n# System: pushed notification from AS to VS WebApp\\n** WebApp processes the incoming notification (text to speech) and play it (add it to history chat)\\n\\nh3. Un-focusing/focusing the web app\\n\\n+A case when user leaves open browser for longer time and switch focus different activities on laptop.+\\n* when user leaves web browser and keep it open. \\n** I presume we discuss mainly laptop web browser, not mobile web browser, the behavior can differ.\\n* the audio: default is it still plays, so I would leave it to default, user can still disable audio for each tab in web browser or completely at OS itself.\\n* web browser might suspend complete web app including audio due to memory optimization. What will happen than?\\n** WebApp shall establish connection if lost\\n** WebApp shall displays info about disconnection if it happens during unfocusing\\n** WebApp shall stop say loudly responses, but it shall put them into history\\n\\nh3. Disconnect machine\\n\\n+A case when user actively disconnect from machine.+\\n# System: machine is connected, status is green\\n# User clicks on button Disconnect\\n** System: calls unregister at AS\\n** System: update WebApp with result from AS\\n# Machine is disconnected\\n** textbox machineId is empty\\n** button is \\"disabled\\" (it activates once something is typed intextbox\\n\\nh2. Architecture\\n\\nh3. SABOT AS integration\\n\\nTODO (Nikita) add details about web app arch\\n\\nh3. STT & TTS services\\n\\nTODO (Nikita) add details of azure stt & tts implementation\\n\\nh3.  Security\\n\\nTODO (Nikita) add details of user authentication\\n\\nh2. Q&A\\n\\n# shall we allow to use keyboard input?\\n# add option to remember previously connected machines"'
)

const html = textile(TEXTILE_CONTENT)
const markdown = turnDownService.turndown(html)
console.log('========html========')
console.log(html)
console.log('========markdown========')
console.log(markdown)
