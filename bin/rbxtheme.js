#! /usr/bin/env node
import fs from 'fs'
import convert from '../index.js'

const themeFile = process.argv[2]

const usage = () => {
}

const exit = (message) => {
    console.error(message)
    console.log('Usage: rbxtheme path/to/theme.json')
}

console.log('hello world!')

if (themeFile) {
    if (fs.existsSync(themeFile)) {
        convert(themeFile)
    } else {
        exit(`Could not find a theme file at the path ${themeFile}`)
    }
} else {
    exit('No theme file provided')
}