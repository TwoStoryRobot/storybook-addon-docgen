/**
 * BSD License
 *
 * For React docs generator software
 *
 * Copyright (c) 2015, Facebook, Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const isObject = value =>
  value && typeof value === 'object' && value.constructor === Object

const generateTitle = name => '`' + name + '`' + '\n===\n'

const generateDescription = description => description + '\n'

const generatePropType = type =>
  type.name +
  (type.value && type.name !== 'shape'
    ? Array.isArray(type.value)
      ? `(${type.value.map(v => v.name || v.value).join('&#124;')})`
      : type.value
    : '')

const generatePropDefaultValue = value => `\`${value.value}\``

const generateProp = (propName, prop) => {
  const row = [
    '`' + propName + '`',
    prop.type ? generatePropType(prop.type) : '',
    prop.required ? 'yes' : 'no',
    prop.defaultValue ? generatePropDefaultValue(prop.defaultValue) : '',
    prop.description ? prop.description : ''
  ].join('|')

  const { type } = prop

  if (type && type.value && isObject(type.value)) {
    return (
      row +
      '\n' +
      Object.keys(type.value)
        .sort()
        .map(name =>
          generateProp(`${propName}/${name}`, {
            type: {
              name: type.value[name].name
            },
            required: type.value[name].required
          })
        )
        .join('\n')
    )
  }

  return row
}

const generateProps = props => {
  const title =
    '|name|type|required|default|description|\n|---|---|---|---|---|\n'
  return props
    ? title +
        Object.keys(props)
          .sort()
          .map(name => generateProp(name, props[name]))
          .join('\n')
    : title
}

const generateMarkdown = reactAPI =>
  [
    generateTitle(reactAPI.displayName),
    generateDescription(reactAPI.description),
    generateProps(reactAPI.props)
  ].join('\n')

export default generateMarkdown
