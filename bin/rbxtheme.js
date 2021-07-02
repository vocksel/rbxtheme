#! /usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import fs from 'fs'
import convert from '../index.js'

program
    .version('1.0.0')
    .argument('<themeFile>', `Path to the theme's json file. These can be found in ~/.vscode/extensions`)
    .option('-c, --clipboard', 'Copy the generated command to the clipboard automatically')
    .showHelpAfterError()
    .action(async (themeFile, options) => {
        if (fs.existsSync(themeFile)) {
            const command = convert(themeFile)
            const minified = command.replace(/\s+|[\t\r\n]/gm, ' ')

            if (options.clipboard) {
                await clipboardy.write(minified)
                console.log('Theme copied to clipboard. Paste it into the command bar in Studio to set your ' +
                    'Script Editor theme.')
            } else {
                console.log('Copy/paste this command into the command bar in Studio to set your Script Editor theme')
                console.log('\n' + minified)
            }
        } else {
            console.log(chalk.red(`Could not find a theme file at the path '${themeFile}'`))
            command.help()
        }
    })
    .parse(process.argv)