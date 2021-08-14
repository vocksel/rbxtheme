#! /usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import { stat, readFile } from 'fs/promises'
import JSON5 from 'json5'
import path from 'path'
import { convert, getAvailableThemes, getThemeFromName, logArray } from './theme.js'

const __dirname = path.dirname(import.meta.url.substring(8))
const pkg = JSON5.parse(await readFile(path.join(__dirname, '../package.json')))

program
    .version(pkg.version)
    .showHelpAfterError()

program
    .command('list', { isDefault: true })
    .description('Lists the names of the available themes. Use these names with the `convert` command to generate '
        + 'Studio themes.')
    .action(async () => {
        const themes = await getAvailableThemes()

        console.log('Available themes:')
        logArray(themes.map(theme => theme.name))

        console.log('Run `rbxtheme convert <theme>` with one of the listed themes')
    })

program
    .command('convert')
    .description('Converts one of the available VSCode themes into a command you can run from Studio to set your '
        + 'Script Editor colors')
    .argument('<theme>', `Name of the theme file to convert. Run 'rbxtheme list' for a list of themes you can use. This can also be a direct path to a theme's json file`)
    .option('-c, --copy', 'Copy the generated command to the clipboard automatically')
    .option('-e, --expanded', 'Log the Studio command in its non-minified form')
    .action(async (theme, options, command) => {
        let themePath
        if (theme?.endsWith('.json')) {
            themePath = theme
        } else {
            themePath = await getThemeFromName(theme)
        }

        const stats = await stat(themePath)
            .catch(err => {
                if (err.code !== 'ENOENT') {
                    console.error(err)
                }
            })

        if (stats.isFile()) {
            const [command, missingColors] = await convert(themePath)
            const minified = command.replace(/\s+|[\t\r\n]/gm, ' ')

            if (missingColors.length > 0) {
                const colorList = missingColors.toString()

                console.log(chalk.yellow(`WARN: Some colors could not be converted: ${colorList}`))
                console.log(chalk.yellow(`Please submit an issue to ${pkg.bugs.url} with a link to the theme `
                    + `you are converting.`))
            }

            if (options.copy) {
                clipboardy.write(minified).then(() => {
                    console.log('Theme copied to clipboard. Paste it into the command bar in Studio to change your ' +
                        'Script Editor theme.')
                })
            } else {
                console.log('Copy/paste this command into the command bar in Studio to set your Script Editor theme')

                if (options.expanded) {
                    console.log('\n' + command)
                } else {
                    console.log('\n' + minified)
                }
            }
        } else {
            console.log(chalk.red(`Could not find a theme file named '${theme}'`))
            command.help()
        }
    })

program.parse(process.argv)
