#! /usr/bin/env node
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import fs from 'fs'
import convert from '../index.js'

const themeFile = process.argv[2]

const exit = (message) => {
    console.error(chalk.red(message))
    console.log('Usage: rbxtheme path/to/theme.json')
}   

const copiedSuccessfully = () => {
    console.log('Theme copied to clipboard. Paste it into the command bar in Studio to set your Script Editor theme.')
}

if (themeFile) {
    if (fs.existsSync(themeFile)) {
        const command = convert(themeFile)
        const minified = command.replace(/\s+|[\t\r\n]/gm, ' ')
        
        clipboardy.write(minified)
            .then(copiedSuccessfully)
    } else {
        exit(`Could not find a theme file at the path ${themeFile}`)
    }
} else {
    exit('No theme file provided')
}