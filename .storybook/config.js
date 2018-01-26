import { configure } from '@storybook/react'

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(() => require('../example/Button.story.js'), module)
