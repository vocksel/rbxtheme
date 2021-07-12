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

```
$ rbxtheme convert "SynthWave '84"
Copy/paste this command into the command bar in Studio to set your Script Editor theme

local ChangeHistoryService = game:GetService("ChangeHistoryService") local json = [[{"Background Color":[38,35,53],"Selection Color":[255,255,255],"Selection Background Color":[255,255,255],"Error Color":[254,68,80],"Warning Color":[114,241,184],"Find Selection Background Color":[209,134,22],"Matching Word Background Color":[255,255,255],"Whitespace Color":[255,255,255],"Current Line Highlight Color":[38,35,53],"Ruler Color":[161,72,171],"Bracket Color":[255,255,255],"Text Color":[255,126,219],"Operator Color":[254,222,93],"Number Color":[249,126,114],"String Color":[255,139,57],"Comment Color":[132,139,189],"Bool Color":[249,126,114],"\"nil\" Color":[249,126,114],"Function Name Color":[54,249,246],"\"function\" Color":[254,222,93],"\"local\" Color":[254,222,93],"\"self\" Color":[254,68,80],"Luau Keyword Color":[255,126,219],"Keyword Color":[254,222,93],"Built-in Function Color":[54,249,246],"\"TODO\" Color":[255,126,219],"Method Color":[54,249,246],"Property Color":[54,249,246]}]] local theme = game.HttpService:JSONDecode(json) ChangeHistoryService:SetWaypoint("Changing theme") local studio = settings().Studio for name, color in pairs(theme) do color = Color3.fromRGB(color[1], color[2], color[3]) local success = pcall(function() studio[name] = color end) if not success then warn(("%s is not a valid theme color"):format(name)) end end ChangeHistoryService:SetWaypoint("Theme changed") print("Successfully changed your Script Editor theme!")

# Use the --copy flag to have the command copied to your clipboard
$ rbxtheme convert --copy "SynthWave '84"
Theme copied to clipboard. Paste it into the command bar in Studio to change your Script Editor theme.
```
