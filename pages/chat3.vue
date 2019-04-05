<template>
<div>
  <section class="hero hero-phone pa-5" :style="{ backgroundColor: bgColor }">
    <v-layout>
      <v-flex md4 wrap>
        <div class="title white--text mb-3 pl-3">{{ title1 }}</div>
        <div class="white--text pl-3"><pre class="body-2 menu">{{ subtitle1 }}</pre></div>
      </v-flex>
      <v-flex md4>
        <div class="title white--text mb-2 pl-3">{{ title2 }}</div>
        <div class="white--text pl-3"><pre class="body-2 menu">{{ subtitle2 }}</pre></div>
      </v-flex>
      <v-flex md4>
        <div class="title white--text mb-2 pl-3">{{ title3 }}</div>
        <div class="white--text pl-3"><pre class="body-2 menu">{{ subtitle3 }}</pre></div>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex md4 class="phone-mockup mt-4">
        <div class="screen">
          <v-container class="pa-0">
            <v-layout column>
              <v-flex>
                <v-toolbar flat color="white">
                  <v-avatar class="ml-1">
                    <img :src="avatarUrl" alt="avatar" />
                  </v-avatar>
                  <v-toolbar-title>
                    <div class="title font-weight-bold">
                      {{ companyName }}
                    </div>
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
              </v-flex>
              <!-- chat -->
              <v-flex class="ma-2 pt-0">
                <div class="bot-msg-container" v-html="jsonToHTML()"></div>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
      </v-flex>
      <v-flex md4 class="phone-mockup mt-4">
        <div class="screen">
          <v-container class="pa-0">
            <v-layout column>
              <v-flex>
                <v-toolbar flat color="white">
                  <v-avatar class="ml-1">
                    <img :src="avatarUrl" alt="avatar" />
                  </v-avatar>
                  <v-toolbar-title>
                    <div class="title font-weight-bold">
                      {{ companyName }}
                    </div>
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
              </v-flex>
              <!-- chat -->
              <v-flex class="ma-2 pt-0">
                <div class="bot-msg-container" v-html="jsonToHTML2()"></div>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
      </v-flex>
      <v-flex md4 class="phone-mockup mt-4">
        <div class="screen">
          <v-container class="pa-0">
            <v-layout column>
              <v-flex>
                <v-toolbar flat color="white">
                  <v-avatar class="ml-1">
                    <img :src="avatarUrl" alt="avatar" />
                  </v-avatar>
                  <v-toolbar-title>
                    <div class="title font-weight-bold">
                      {{ companyName }}
                    </div>
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
              </v-flex>
              <!-- chat -->
              <v-flex class="ma-2 pt-0">
                <div class="bot-msg-container" v-html="jsonToHTML3()"></div>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
      </v-flex>
      <!-- <v-flex md8 class="mt-5 ml-5">
        <div class="display-2 white--text">
          <pre class="menu">{{ headline }}</pre>
          <pre class="menu">{{ subheadline }}</pre>
        </div>
        <div class="title white--text mt-5">
          <pre class="menu">{{ copy }}</pre>
        </div>
        <div class="menu body-2 white--text mt-5 signature">
          <div class="ml-3 mb-0">- Shawn</div>
          <v-chip class="signature-email">
            <v-avatar>
              <img class="ml-2" src="https://res.cloudinary.com/cupbots/image/upload/v1554346787/site-icon.png">
            </v-avatar>
            <div class="white--text">
              l@cupbots.com
            </div>
          </v-chip>
        </div>
      </v-flex> -->
    </v-layout>
  </section>
  <v-layout>
    <v-flex class="white pa-5">
      <div class="headline">Settings</div>
      <v-text-field v-model="companyName" label="Company name" />
      <v-text-field v-model="bgColor" label="Background color" />
      <v-text-field v-model="avatarUrl" label="Avatar" />
      <v-textarea 
        v-model="headline"
        box
        label="Headline"
      />
      <v-textarea 
        v-model="subheadline"
        box
        label="Subheadline"
      />
      <v-textarea 
        v-model="copy"
        box
        label="Body text"
      />

      <!-- title 1 -->
      <v-textarea 
        v-model="title1"
        box
        label="Title 1"
      />
      <v-textarea 
        v-model="subtitle1"
        box
        label="Subtitle 1"
      />

      <!-- title 1 -->
      <v-textarea 
        v-model="title2"
        box
        label="Title 2"
      />
      <v-textarea 
        v-model="subtitle2"
        box
        label="Subtitle 2"
      />

      <!-- title 1 -->
      <v-textarea 
        v-model="title3"
        box
        label="Title 3"
      />
      <v-textarea 
        v-model="subtitle3"
        box
        label="Subtitle 3"
      />
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import { jsonToHTML } from '~/utils/helpers'

export default {
  layout: 'plain',
  data () {
    return {
      companyName: 'Cupbots',
      bgColor: '#333',
      avatarUrl: 'https://res.cloudinary.com/cupbots/image/upload/v1554347303/nclol7iji8lyjf62hjuz.png',
      headline: `Shawn`,
      subheadline: `This could be your chatbot.`,
      copy: 'Body copy text',
      title1: 'Title1',
      subtitle1: 'Subtitle1 Subtitle1 \n\nSubtitle1 Subtitle1 Subtitle1 Subtitle1',
      title2: 'Title2',
      subtitle2: 'Subtitle2',
      title3: 'Title3',
      subtitle3: 'Subtitle3'
    }
  },
  methods: {
    jsonToHTML () {
      if (this.$store.state.txt) {
        return jsonToHTML(this.$store.state.txt)
      }
    },
    jsonToHTML2 () {
      if (this.$store.state.txt2) {
        return jsonToHTML(this.$store.state.txt2)
      }
    },
    jsonToHTML3 () {
      if (this.$store.state.txt3) {
        return jsonToHTML(this.$store.state.txt3)
      }
    }
  }
}
</script>

<style>
  .phone-mockup {
    background-image: url('~/static/minimal_phone_mockup_grey.png');
    height: 100vh;
    width:100%;
    background-repeat: no-repeat;
    background-size: 300px;
  }

  .screen {
    /* background-color: #333; */
    height: 90vh;
    margin: 37px 0 0 12px;
    width: 278px;
  }

  span.v-chip.signature-email.theme--light {
    background-color: #333;
  }
</style>

