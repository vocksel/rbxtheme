# rbxtheme

Converts a Visual Studio Code theme into one that is compatible with Roblox Studio's script editor.

## Usage

Install the package globally to get access to the `rbxtheme` command.

```sh
$ npm install -g rbxtheme
# Or
$ yarn global add rbxtheme
```

Then you can view the list of all the available themes.

```sh
$ rbxtheme list
```

After picking a theme, run it through `rbxtheme` to convert it into a command that you can run from Roblox Studio.

```sh
$ rbxtheme convert "SynthWave '84"
# Use the --copy flag to have the command copied to your clipboard
$ rbxtheme convert --copy "SynthWave '84"
```
