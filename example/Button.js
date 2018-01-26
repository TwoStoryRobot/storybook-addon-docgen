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

Button.defaultProps = {
  children: '🤷‍♀️'
}

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
}

export default Button
