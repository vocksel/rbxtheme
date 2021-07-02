#! /usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import os from 'os'
import fs from 'fs'
import { readdir, stat, readFile } from 'fs/promises'
import JSON5 from 'json5'
import path from 'path'
import convert from '../index.js'

const ISSUES_URL = 'https://github.com/vocksel/roblox-theme-converter/issues'

const getAvailableThemes = async () => {
    const extensionsPath = path.join(os.homedir(), '.vscode/extensions/')
    const extensions = await readdir(extensionsPath)

    const themes = []

    for (const extension of extensions) {
        const extensionPath = path.join(extensionsPath, extension)
        const stats = await stat(extensionPath)

        if (stats.isDirectory()) {
            const items = await readdir(extensionPath)
            const themesFolder = items.find(item => item === 'themes') 

            if (themesFolder) {
                const themesPath = path.join(extensionPath, 'themes')
                const themeFiles = await readdir(themesPath)

                for (const themeFile of themeFiles) {
                    if (themeFile.endsWith('.json')) {
                        const themePath = path.join(themesPath, themeFile)
                        
                        let theme
                        try {
                            theme = JSON5.parse(await readFile(themePath))
                        } catch {
                            // Ignore
                        }

                        if (theme?.name) {
                            themes.push({
                                name: theme.name,
                                path: themePath,
                            })
                        }
                    }
                }
            }
        }
    }

    return themes
}

const getThemeFromName = async (themeName) => {
    // Check if the theme exists in the cwd first so that we can easily test any theme file.
    const relativeTheme = fs.existsSync(themeName)
    
    if (relativeTheme) {
        return themeName
    } else {
        const themes = await getAvailableThemes()
        const theme = themes.find(theme => themeName === theme.name)

        if (theme) {
            return theme.path
        }
    }
}

program
    .version('1.0.0')
    .showHelpAfterError()

program
    .command('convert', { isDefault: true })
    .description('Converts one of the available VSCode themes into a command you can run from Studio to set your '
        + 'Script Editor colors')
    .argument('<theme>', `Name of the theme file to convert. Run 'rbxtheme list' for a list of themes you can use`)
    .option('-c, --clipboard', 'Copy the generated command to the clipboard automatically')
    .option('-e, --expanded', 'Log the Studio command in its non-minified form')
    .action(async (theme, options, command) => {
        const themePath = await getThemeFromName(theme)

        if (fs.existsSync(themePath)) {
            const [command, missingColors] = convert(themePath)
            const minified = command.replace(/\s+|[\t\r\n]/gm, ' ')
            
            if (missingColors.length > 0) {
                const colorList = missingColors.toString()
        
                console.log(chalk.yellow(`WARN: Some colors could not be converted: ${colorList}`))
                console.log(chalk.yellow(`Please submit an issue to ${ISSUES_URL} with a link to the theme `
                    + `you are converting.`))
            }

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
        } else {
            console.log(chalk.red(`Could not find a theme file named '${theme}'`))
            command.help()
        }
    })

program
    .command('list')
    .description('Lists the names of the available themes. Use these names with the `convert` command to generate '
        + 'Studio themes.')
    .action(async () => {
        const themes = await getAvailableThemes()

        console.log('Available themes:')
        for (const {name} of themes) {
            console.log(`- ${name}`)
        }
    })

program.parse(process.argv)
