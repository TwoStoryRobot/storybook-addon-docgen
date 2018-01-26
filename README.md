# storybook-addon-docgen

Generates documentation using react-docgen

## Development

```bash
# Fork this repo and git clone it
npm install
npm run storybook
```

## Usage

Add the `docgen` decorator to your stories. You must supply the component you
want the documentation from. In this case we want to docs supplied from the
Button component.

```jsx
storiesOf('Button', module)
  .addDecorator(docgen(Button))
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
```
