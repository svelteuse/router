import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { generateImportIdentifier, generateImportPath, generateRoutePath } from '../src/node/node'

const node = suite('node')

node('static root level', () => {
  assert.equal(
    generateImportIdentifier('pages\\Fillingquantaties.svelte', 'pages'),
    'Fillingquantaties'
  )
})
node('dynamic root level', () => {
  assert.equal(generateImportIdentifier('pages\\[id].svelte', 'pages'), 'ID')
})
node('static first child level', () => {
  assert.equal(generateImportIdentifier('pages\\user\\contract.svelte', 'pages'), 'User_Contract')
})
node('dynamic first child level', () => {
  assert.equal(generateImportIdentifier('pages\\user\\[id].svelte', 'pages'), 'User_ID')
})
node('static second child level', () => {
  assert.equal(
    generateImportIdentifier('pages\\user\\contract\\index.svelte', 'pages'),
    'User_Contract_Index'
  )
})
node('dynamic second child level', () => {
  assert.equal(
    generateImportIdentifier('pages\\user\\contract\\[id].svelte', 'pages'),
    'User_Contract_ID'
  )
})
node('dynamic sub parameter', () => {
  assert.equal(
    generateImportIdentifier('pages\\machine\\[slug]\\techdata.svelte', 'pages'),
    'Machine_SLUG_Techdata'
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

//#region
node('route path static first level', () => {
  assert.equal(generateRoutePath('Fillingquantaties'), '/fillingquantaties')
})
node('route path dynamic first level', () => {
  assert.equal(generateRoutePath('ID'), '/:id')
})
node('route path static second level', () => {
  assert.equal(generateRoutePath('User_Contract'), '/user/contract')
})
node('route path dynamic second level', () => {
  assert.equal(generateRoutePath('User_ID'), '/user/:id')
})
node('route path static third level', () => {
  assert.equal(generateRoutePath('User_Contract_New'), '/user/contract/new')
})
node('route path dynamic third level', () => {
  assert.equal(generateRoutePath('User_Contract_ID'), '/user/contract/:id')
})
node('index mapping', () => {
  assert.equal(generateRoutePath('User_Contract_Index'), '/user/contract')
})
node('root path', () => {
  assert.equal(generateRoutePath('User_Contract_Index', '/:lang'), '/:lang/user/contract')
})
node('dynamic sub parameter', () => {
  assert.equal(
    generateRoutePath('Machine_SLUG_techdata', '/:lang'),
    '/:lang/machine/:slug/techdata'
  )
})
//#endregion

node.run()
