import React from 'react'
import addons from '@storybook/addons'

const docgenAddon = component => storyFn => {
  const channel = addons.getChannel()
  channel.emit('twostoryrobot/docgen/add_docs', component.__docgenInfo)

  return storyFn()
}

export default docgenAddon
