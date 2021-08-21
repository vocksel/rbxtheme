#! /usr/bin/env node

import { program } from 'commander'
import { readFile } from 'fs/promises'
import JSON5 from 'json5'
import path from 'path'
import { convert, list } from './commands/index.js'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON5.parse(await readFile(path.join(__dirname, '../package.json')))

program
    .version(pkg.version)
    .showHelpAfterError()

program
    .command('list')
    .description('Lists the names of the available themes. Use these names with the `convert` command to generate '
        + 'Studio themes.')
    .action(list)

program
    .command('convert')
    .description('Converts one of the available VSCode themes into a command you can run from Studio to set your '
        + 'Script Editor colors')
    .argument('<theme>', `Name of the theme file to convert. Run 'rbxtheme list' for a list of themes you can use. This can also be a direct path to a theme's json file`)
    .option('-c, --copy', 'Copy the generated command to the clipboard automatically')
    .option('-e, --expanded', 'Log the Studio command in its non-minified form')
    .action(convert)

program.parse(process.argv)
