#! /usr/bin/env node

import chalk from 'chalk'
import clipboardy from 'clipboardy'
import { stat } from 'fs/promises'
import { convert as convertTheme, getThemeFromName } from '../theme/index.js'

const convert = async (theme, options, command) => {
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
        const [command, missingColors] = await convertTheme(themePath)
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
}

export default convert