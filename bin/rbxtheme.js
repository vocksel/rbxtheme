#! /usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import fs from 'fs'
import convert from '../index.js'

const ISSUES_URL = 'https://github.com/vocksel/roblox-theme-converter/issues'

program
    .version('1.0.0')
    .argument('<themeFile>', `Path to the theme's json file. These can be found in ~/.vscode/extensions`)
    .option('-c, --clipboard', 'Copy the generated command to the clipboard automatically')
    .option('-e, --expanded', 'Log the Studio command in its non-minified form')
    .showHelpAfterError()
    .action(async (themeFile, options) => {
        if (fs.existsSync(themeFile)) {
            const [command, missingColors] = convert(themeFile)
            const minified = command.replace(/\s+|[\t\r\n]/gm, ' ')

            if (options.clipboard) {
                await clipboardy.write(minified)
                console.log('Theme copied to clipboard. Paste it into the command bar in Studio to change your ' +
                    'Script Editor theme.')
            } else {
                console.log('Copy/paste this command into the command bar in Studio to set your Script Editor theme')
                
                if (options.expanded) {
                    console.log('\n' + command)
                } else {
                    console.log('\n' + minified)
                }
            }

            if (missingColors.length > 0) {
                const colorList = missingColors.toString()
        
                console.log(chalk.yellow(`\nWARN: Some colors could not be converted: ${colorList}`))
                console.log(chalk.yellow(`Please submit an issue to ${ISSUES_URL} with a link to the theme `
                    + `you are converting.`))
            }
        } else {
            console.log(chalk.red(`Could not find a theme file at the path '${themeFile}'`))
            command.help()
        }
    })
    .parse(process.argv)