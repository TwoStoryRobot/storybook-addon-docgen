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

const generatePropType = type => {
  if (Array.isArray(type.name)) {
    return `${type.name.map(v => v.name || v.value).join(' &#124; ')}`
  } else {
    return (
      type.name +
      (type.value && type.name !== 'shape'
        ? Array.isArray(type.value)
          ? `(${type.value.map(v => v.name || v.value).join(' &#124; ')})`
          : ' ' //+ type.value.name || type.value // type.value might not be necessary
        : '')
    )
  }
}

const generatePropDefaultValue = value => `\`${value.value}\``

const generateProp = (propName, prop, unvisitedNodes = []) => {
  const row =
    '|' +
    [
      '`' + propName + '`',
      prop.type ? generatePropType(prop.type) : '',
      prop.required ? 'yes' : 'no',
      prop.defaultValue ? generatePropDefaultValue(prop.defaultValue) : '',
      prop.description ? prop.description : ''
    ].join('|') +
    '|'

  const { type } = prop

  if (type.name === 'shape') {
    // also no need for the next few cases if this is true
    unvisitedNodes.push(type)
  } else if (
    type &&
    type.value &&
    isObject(type.value) &&
    type.name !== 'shape'
  ) {
    let keys = Object.keys(type.value)

    let names = []
    keys.forEach(key =>
      names.push(type[key].name !== undefined ? type[key].name : type[key])
    )

    // ['a', 'b', 'c'] -> ['a', 'a/b', 'a/b/c']
    let namesAccumulated = names.reduce(
      (a, x, i) => [...a, `${a[i - 1] ? a[i - 1] + '/' : ''}${x}`],
      []
    )

    return (
      row +
      '\n' +
      keys
        .map((key, index) =>
          generateProp(`${propName}/${namesAccumulated[index]}`, {
            type: {
              name: type.value[key]
            },
            required: type.value[key].required
          })
        )
        .join('\n')
    )
    // PropTypes.oneOf and PropTypes.oneOfType are represented as an array
  } else if (Array.isArray(type.value) || Array.isArray(type.name)) {
    let newNodes = Object.create(type.value || type.name)

    // only add nodes that have a value property (i.e further nesting)
    newNodes = newNodes.filter(node => node.value !== undefined)

    if (newNodes.length !== 0) {
      unvisitedNodes = [...unvisitedNodes, ...newNodes]

      if (unvisitedNodes[unvisitedNodes.length - 1].name !== 'shape') {
        let currentNode = unvisitedNodes.pop()

        let keys = Object.keys(currentNode)

        return (
          row +
          '\n' +
          keys
            .map(key =>
              generateProp(
                `${propName}/${currentNode.name}${
                  Array.isArray(currentNode.value[key])
                    ? '/' + currentNode.value.name
                    : ''
                }`,
                {
                  type: {
                    name: currentNode.value[key]
                  },
                  required:
                    currentNode.required !== undefined
                      ? currentNode.required
                      : false //currentNode[key].required
                },
                unvisitedNodes
              )
            )
            .join('\n')
        )
      }
    }
  }

  if (unvisitedNodes !== undefined && unvisitedNodes.length !== 0) {
    let currentNode = unvisitedNodes.pop()

    if (currentNode.name !== 'shape') {
      return (
        row +
        '\n' +
        generateProp(
          `${propName}`,
          {
            type: {
              name: currentNode.value.name
            },
            required:
              currentNode.required !== undefined ? current.required : false //currentNode[key].required
          },
          unvisitedNodes
        )
      )
    } else {
      let keys = Object.keys(currentNode.value)
      console.log('SHAPE KEYS')
      console.log(keys)
      console.log('VLAUES')
      let values = Object.values(currentNode.value)
      console.log(values)

      keys.map((key, index) =>
        unvisitedNodes.push({
          type: {
            name: key,
            value: values[index]
          }
        })
      )

      // let currentNode = currentNode.pop()

      // return (
      //   row +
      //   '\n' +
      //     generateProp(
      //       `${propName}${
      //         propName.substr(propName.length - 5) === 'shape' ? '' : '/shape'
      //       }/${currentNode.name}`,
      //       {
      //         type: {
      //           name: JSON.stringify(currentNode.value)
      //         },
      //         required:
      //           currentNode.required !== undefined
      //             ? currentNode.required
      //             : false //currentNode[key].required
      //       },
      //       unvisitedNodes
      //     )
      //   )
    }
  } else if (type.name === 'shape') {
    console.log('SHAPE CASE')
    console.log(type)
  } else {
    console.log('END CASE')
    console.log(type)
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
