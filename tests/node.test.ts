import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { generateImportPath, parseFile } from '../src/node/node'

const node = suite('node')

node('static root level', () => {
  assert.equal(
    parseFile('pages\\Fillingquantaties.svelte', 'pages').identifier,
    'Fillingquantaties'
  )
  assert.equal(parseFile('pages\\Fillingquantaties.svelte', 'pages').path, '/fillingquantaties')
})
node('dynamic root level', () => {
  assert.equal(parseFile('pages\\[id].svelte', 'pages').identifier, 'ID')
  assert.equal(parseFile('pages\\[id].svelte', 'pages').path, '/:id')
})
node('static first child level', () => {
  assert.equal(parseFile('pages\\user\\contract.svelte', 'pages').identifier, 'User_Contract')
  assert.equal(parseFile('pages\\user\\contract.svelte', 'pages').path, '/user/contract')
})
node('dynamic first child parseFile', () => {
  assert.equal(parseFile('pages\\user\\[id].svelte', 'pages').identifier, 'User_ID')
  assert.equal(parseFile('pages\\user\\[id].svelte', 'pages').path, '/user/:id')
})
node('static second child level', () => {
  assert.equal(
    parseFile('pages\\user\\contract\\index.svelte', 'pages').identifier,
    'User_Contract_Index'
  )
  assert.equal(parseFile('pages\\user\\contract\\index.svelte', 'pages').path, '/user/contract')
})
node('dynamic second child level', () => {
  assert.equal(
    parseFile('pages\\user\\contract\\[id].svelte', 'pages').identifier,
    'User_Contract_ID'
  )
  assert.equal(parseFile('pages\\user\\contract\\[id].svelte', 'pages').path, '/user/contract/:id')
})
node('dynamic sub parameter', () => {
  assert.equal(
    parseFile('pages\\machine\\[slug]\\techdata.svelte', 'pages').identifier,
    'Machine_SLUG_Techdata'
  )
  assert.equal(
    parseFile('pages\\machine\\[slug]\\techdata.svelte', 'pages').path,
    '/machine/:slug/techdata'
  )
})
node('dynamic sub parameter', () => {
  assert.equal(
    parseFile('pages\\machine\\[slug]\\techdata.svelte', 'pages', '/:lang').identifier,
    'Machine_SLUG_Techdata'
  )
  assert.equal(
    parseFile('pages\\machine\\[slug]\\techdata.svelte', 'pages', '/:lang').path,
    '/:lang/machine/:slug/techdata'
  )
})

//#region
node('convert parsedPath to importPath', () => {
  assert.equal(
    generateImportPath('pages\\user\\contract\\[id].svelte'),
    '"./pages/user/contract/[id].svelte"'
  )
})
node('convert parsedPath to importPath', () => {
  assert.equal(
    generateImportPath('pages\\machine\\[slug]\\techdata.svelte'),
    '"./pages/machine/[slug]/techdata.svelte"'
  )
})
//#endregion

node.run()
