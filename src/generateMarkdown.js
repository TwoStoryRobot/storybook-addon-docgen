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

const generateRootNodes = props => {
  let keys = Object.keys(props)
  let rootNodes = []
  keys.map(prop =>
    rootNodes.push({
      name: `${prop}`,
      value: props[prop].type || '',
      required: props[prop].required,
      defaultValue: props[prop].defaultValue,
      description: props[prop].description
    })
  )

  return rootNodes
}

const breadthFristSearch = rootNode => {
  // Check that a root node exists.
  if (rootNode === null) {
    return
  }

  // Create our queue and push our root node into it.
  let queue = []
  let row = ''

  rootNode.accumulatedName = rootNode.name
  queue.push(rootNode)

  // Continue searching through as queue as long as it's not empty.
  while (queue.length > 0) {
    // Create a reference to currentNode, at the top of the queue.
    let currentNode = queue[0]
    let printValue = []

    if (currentNode !== undefined && currentNode['value']) {
      switch (currentNode.value.name) {
        case 'union':
          currentNode.value.name = 'oneOfType'
          break
        case 'enum':
          currentNode.value.name = 'oneOf'
          break
      }
    }

    // Push all adjacent nodes to the queue.
    if (currentNode.name === 'shape') {
      let keys = Object.keys(currentNode.value)
      keys.map(key => {
        key !== 'accumulatedName'
          ? queue.push({
              accumulatedName: `${currentNode.accumulatedName}/${key}`,
              name: key,
              value:
                currentNode.value[key].raw !== undefined
                  ? currentNode.value[key].raw
                  : currentNode.value[key],
              required: currentNode.value[key].required
            })
          : ''
        printValue.push(`${key}`)
      })
    } else if (currentNode.name === 'oneOf') {
      let nodes = currentNode.value
      nodes.map((node, index) => {
        queue.push({
          accumulatedName: `${currentNode.accumulatedName}/${index}`,
          name: index,
          value: node.value,
          required: false
        })
        printValue.push(`${index}`)
      })
    } else {
      let adjacentNode = currentNode.value

      if (adjacentNode !== undefined) {
        // oneOfType is represented as an array
        if (Array.isArray(adjacentNode)) {
          adjacentNode.map(node => {
            let accumulatedName = `${currentNode.accumulatedName}/${node.name}`
            node.accumulatedName = accumulatedName
            queue.push(node)
            printValue.push(`${node.name}`)
          })
        } else if (isObject(adjacentNode)) {
          let accumulatedName = `${currentNode.accumulatedName}/${
            adjacentNode.name
          }`
          adjacentNode.accumulatedName = accumulatedName
          queue.push(adjacentNode)
          printValue.push(adjacentNode.name)
        }
      }
    }

    // Do stuff with the Current Node
    if (currentNode.value !== undefined) {
      // remove this to print leaf nodes in union/ enum as new line
      printValue.length === 0 ? printValue.push(currentNode.value) : ''
      row +=
        [
          '`' + currentNode.accumulatedName + '`',
          printValue.join(', '),
          currentNode.required ? 'yes' : 'no',
          currentNode.defaultValue
            ? generatePropDefaultValue(currentNode.defaultValue)
            : '',
          currentNode.description ? currentNode.description : '|'
        ].join('|') + '\n'
    }

    // Remove the currentNode from the queue.
    queue.shift()
  }

  return row
}

const generateTable = props => {
  let table = ''
  let rootNodes = generateRootNodes(props)
  rootNodes.forEach(rootNode => (table += breadthFristSearch(rootNode)))

  return table
}

const generateProps = props => {
  const title =
    '|name|type|required|default|description|\n|---|---|---|---|---|\n'
  return props ? title + generateTable(props) : title
}

const generateMarkdown = reactAPI =>
  [
    generateTitle(reactAPI.displayName),
    generateDescription(reactAPI.description),
    generateProps(reactAPI.props)
  ].join('\n')

export default generateMarkdown
