import React from 'react'
import addons from '@storybook/addons'

class DocgenPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = { docgenInfo: {} }
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
      this.onAddDocs({})
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
    const docs = JSON.stringify(docgenInfo)

    //  TODO: This needs to take the docgenInfo and render it all pretty like 💅
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: docs }} />
      </div>
    )
  }
}

addons.register('twostoryrobot/docgen', api => {
  addons.addPanel('twostoryrobot/docgen/panel', {
    title: 'Docs',
    render: () => <DocgenPanel channel={addons.getChannel()} api={api} />
  })
})
