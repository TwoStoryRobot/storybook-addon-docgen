import React from 'react'
import addons from '@storybook/addons'
import Markdown from 'react-markdown'
import generateMarkdown from './generateMarkdown'

import styles from './css'

const style = document.createElement('style')
style.innerHTML = styles
document.body.appendChild(style)

class DocgenPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = { docgenInfo: null }
    this.onAddDocs = this.onAddDocs.bind(this)
  }

  onAddDocs(docgenInfo) {
    this.setState({ docgenInfo })
  }

  componentDidMount() {
    const { channel, api } = this.props

    //  Listen for new docs
    channel.on('twostoryrobot/docgen/add_docs', this.onAddDocs)

    //  Clear the current docs on every story change
    this.stopListeningOnStory = api.onStory(() => {
      this.onAddDocs(null)
    })
  }

  componentWillUnmount() {
    //  Clean up listeners
    if (this.stopListeningOnStory) this.stopListeningOnStory()
    const { channel } = this.props
    channel.removeListener('twostoryrobot/docgen/add_docs', this.onAddDocs)
  }

  render() {
    const { docgenInfo } = this.state

    if (docgenInfo) {
      return (
        <div>
          <Markdown
            className="storybook-addon-docgen"
            source={generateMarkdown(docgenInfo)}
          />
        </div>
      )
    } else {
      return <p>Loading...</p>
    }
  }
}

addons.register('twostoryrobot/docgen', api => {
  addons.addPanel('twostoryrobot/docgen/panel', {
    title: 'Docs',
    render: () => <DocgenPanel channel={addons.getChannel()} api={api} />
  })
})
