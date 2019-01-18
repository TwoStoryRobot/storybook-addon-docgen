import React from 'react'
import PropTypes from 'prop-types'

const buttonStyle = {
  backgroundColor: '#60BF9F',
  border: 'none',
  padding: '0 1rem',
  height: '3rem',
  fontSize: '1rem',
  color: '#FFFFFF'
}

/**
 * This button is pretty neat, it has a default emoji if you don't provide a
 * children prop.
 */
const Button = ({ children, ...rest }) => (
  <button style={buttonStyle} {...rest}>
    {children}
  </button>
)

Button.displayName = 'Button'

// Button.defaultProps = {
//   children: '🤷‍♀️'
// }

Button.propTypes = {
  /** The content of the button */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string.isRequired),
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.bool, PropTypes.func]))
  ]),

  quantity: PropTypes.number.isRequired,

  testArray: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        code: PropTypes.string.isRequired,
        id: PropTypes.number,
        age: PropTypes.number
      }),
      PropTypes.number.isRequired,
      PropTypes.string
    ])
  )
}

export default Button
