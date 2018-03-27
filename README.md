
[![Build Status](https://semaphoreci.com/api/v1/twostoryrobot/storybook-addon-docgen/branches/master/shields_badge.svg)](https://semaphoreci.com/twostoryrobot/storybook-addon-docgen)
[![npm (scoped)](https://img.shields.io/npm/v/@twostoryrobot/storybook-addon-docgen.svg)](https://www.npmjs.com/package/@twostoryrobot/storybook-addon-docgen)

# storybook-addon-docgen

Generates documentation using react-docgen

## Development

```bash
# Fork this repo and git clone it
npm install
npm run storybook
```

## Usage

Add the addon to your `.storybook/addons.js`

```javascript
import '@twostoryrobot/storybook-addon-docgen/register'
```

Add the `docgen` decorator to your stories. You must supply the component you
want the documentation from. In this case we want to docs supplied from the
Button component.

```jsx
import docgen from '@twostoryrobot/storybook-addon-docgen'

storiesOf('Button', module)
  .addDecorator(docgen(Button))
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
```
