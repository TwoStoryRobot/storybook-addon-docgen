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
          : ' '
        : '')
    )
  }
}

const generatePropDefaultValue = value => `\`${value.value}\``

const generateProp = (propName, prop, unvisitedNodes = []) => {
  let row =
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
    unvisitedNodes.push(type)
  } else if (type.value && isObject(type.value) && type.name !== 'shape') {
    console.log('OBJECT')
    row = generatePropOfTypeObject(type, row, propName, generateProp)

    // PropTypes.oneOf and PropTypes.oneOfType are represented as an array
  } else if (Array.isArray(type.value) || Array.isArray(type.name)) {
    let newNodes = Object.create(type.value || type.name)

    // Only add nodes that have a value property (i.e further nesting)
    newNodes = newNodes.filter(node => node.value !== undefined)

    if (newNodes.length !== 0) {
      unvisitedNodes = [...unvisitedNodes, ...newNodes]

      if (unvisitedNodes[unvisitedNodes.length - 1].name !== 'shape') {
        let currentNode = unvisitedNodes.pop()

        row = generatePropOfTypeArray(
          row,
          propName,
          currentNode,
          unvisitedNodes,
          generateProp
        )
      }
    }
  }

  if (unvisitedNodes !== undefined && unvisitedNodes.length !== 0) {
    console.log('UNVISITED')
    while (unvisitedNodes.length !== 0) {
      let currentNode = unvisitedNodes.pop()
      // AN ARRAY! NEED CASE TO GENERATE ARRAY FROM UNVISITED

      console.log(currentNode)

      if (currentNode.name === 'shape') {
        row = generatePropOfTypeShape(
          row,
          propName,
          currentNode,
          unvisitedNodes,
          generateProp
        )
      } else if (Array.isArray(currentNode.value)) {
        let values = Object.values(currentNode.value)

        console.log('VALUES')
        console.log(values)

        row += '\n'

        values.forEach(
          value =>
            (row +=
              generatePropOfUnvisitedNode(
                row,
                `${propName}/${currentNode.name}`,
                {
                  name: currentNode.name,
                  value: { name: value.name }
                },
                unvisitedNodes,
                generateProp
              ) + '\n')
        )

        row = row.substring(0, row.length - 1) // remove last line break

        console.log('______ROW______')
        console.log(typeof row)
      } else {
        console.log('GENERATE UNVISITED')
        console.log(currentNode)
        row = generatePropOfUnvisitedNode(
          row,
          propName,
          currentNode,
          unvisitedNodes,
          generateProp
        )
      }
    }
  }

  return row
}

let generatePropOfTypeShape = (
  row,
  propName,
  currentNode,
  unvisitedNodes,
  generateProp
) => {
  let keys = Object.keys(currentNode.value)
  let values = Object.values(currentNode.value)

  return (
    row +
    '\n' +
    keys
      .map((key, i) =>
        generatePropOfUnvisitedNode(
          row,
          `${propName}/shape/${key}`,
          {
            name: key,
            value: { name: values[i].name, required: values[i].required }
          },
          unvisitedNodes,
          generateProp
        )
      )
      .join('\n')
  )
}

let generatePropOfUnvisitedNode = (
  row,
  propName,
  currentNode,
  unvisitedNodes,
  generateProp
) => {
  return generateProp(
    `${propName}`,
    {
      type: {
        name: currentNode.value.name
      },
      required:
        currentNode.value.required !== undefined
          ? currentNode.value.required
          : false
    },
    []
  )
}

let generatePropOfTypeArray = (
  row,
  propName,
  currentNode,
  unvisitedNodes,
  generateProp
) => {
  //let keys = Object.keys(currentNode)
  let keys = ['name']

  if (currentNode.value.value !== undefined) {
    keys.push('value')
  }

  console.log(keys)

  console.log('ARRAY')
  console.log(currentNode)

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
              currentNode[key].required !== undefined
                ? currentNode.required
                : false
          },
          unvisitedNodes
        )
      )
      .join('\n')
  )
}

let generatePropOfTypeObject = (type, row, propName, generateProp) => {
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

const generateMarkdown = reactAPI => {
  console.log(reactAPI.props)
  return [
    (generateTitle(reactAPI.displayName),
    generateDescription(reactAPI.description),
    generateProps(reactAPI.props))
  ].join('\n')
}

export default generateMarkdown
