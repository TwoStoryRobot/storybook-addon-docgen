import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import docgen from '../src/index'

import Button from './Button'

storiesOf('Button', module)
  .addDecorator(docgen(Button))
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ))
  .add('with default props', () => <Button onClick={action('clicked')} />)
