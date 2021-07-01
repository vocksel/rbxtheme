#! /usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import fs from 'fs'
import convert from '../index.js'

const exit = (message) => {
    console.error(chalk.red(message))
    console.log('Usage: rbxtheme path/to/theme.json')
}   

const copiedSuccessfully = () => {
    console.log('Theme copied to clipboard. Paste it into the command bar in Studio to set your Script Editor theme.')
}
program
    .version('1.0.0')
    .argument('<themeFile>', `Path to the theme's json file`)
    .option('--show-command', `Log the command to the console. Useful if copying to clipboard doesn't work`)
    .action(async (themeFile, options) => {
        if (fs.existsSync(themeFile)) {
            const command = convert(themeFile)
            const minified = command.replace(/\s+|[\t\r\n]/gm, ' ')
            
            await clipboardy.write(minified)
            copiedSuccessfully()
            
            if (options.showCommand) {
                console.log('\n' + minified)
            }
        } else {
            exit(`Could not find a theme file at the path ${themeFile}`)
        }
    })
    .parse(process.argv)