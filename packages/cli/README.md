@iconoma/cli
=================

A developer-friendly tool to manage and organize icons through CLI and web studio


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@iconoma/cli.svg)](https://npmjs.org/package/@iconoma/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@iconoma/cli.svg)](https://npmjs.org/package/@iconoma/cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @iconoma/cli
$ iconoma COMMAND
running command...
$ iconoma (--version)
@iconoma/cli/0.0.0 win32-x64 node-v20.19.5
$ iconoma --help [COMMAND]
USAGE
  $ iconoma COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`iconoma hello PERSON`](#iconoma-hello-person)
* [`iconoma hello world`](#iconoma-hello-world)
* [`iconoma help [COMMAND]`](#iconoma-help-command)
* [`iconoma plugins`](#iconoma-plugins)
* [`iconoma plugins add PLUGIN`](#iconoma-plugins-add-plugin)
* [`iconoma plugins:inspect PLUGIN...`](#iconoma-pluginsinspect-plugin)
* [`iconoma plugins install PLUGIN`](#iconoma-plugins-install-plugin)
* [`iconoma plugins link PATH`](#iconoma-plugins-link-path)
* [`iconoma plugins remove [PLUGIN]`](#iconoma-plugins-remove-plugin)
* [`iconoma plugins reset`](#iconoma-plugins-reset)
* [`iconoma plugins uninstall [PLUGIN]`](#iconoma-plugins-uninstall-plugin)
* [`iconoma plugins unlink [PLUGIN]`](#iconoma-plugins-unlink-plugin)
* [`iconoma plugins update`](#iconoma-plugins-update)

## `iconoma hello PERSON`

Say hello

```
USAGE
  $ iconoma hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ iconoma hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/theryston/iconoma/blob/v0.0.0/src/commands/hello/index.ts)_

## `iconoma hello world`

Say hello world

```
USAGE
  $ iconoma hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ iconoma hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/theryston/iconoma/blob/v0.0.0/src/commands/hello/world.ts)_

## `iconoma help [COMMAND]`

Display help for iconoma.

```
USAGE
  $ iconoma help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for iconoma.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/commands/help.ts)_

## `iconoma plugins`

List installed plugins.

```
USAGE
  $ iconoma plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ iconoma plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/index.ts)_

## `iconoma plugins add PLUGIN`

Installs a plugin into iconoma.

```
USAGE
  $ iconoma plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into iconoma.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the ICONOMA_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ICONOMA_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ iconoma plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ iconoma plugins add myplugin

  Install a plugin from a github url.

    $ iconoma plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ iconoma plugins add someuser/someplugin
```

## `iconoma plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ iconoma plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ iconoma plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/inspect.ts)_

## `iconoma plugins install PLUGIN`

Installs a plugin into iconoma.

```
USAGE
  $ iconoma plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into iconoma.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the ICONOMA_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ICONOMA_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ iconoma plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ iconoma plugins install myplugin

  Install a plugin from a github url.

    $ iconoma plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ iconoma plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/install.ts)_

## `iconoma plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ iconoma plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ iconoma plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/link.ts)_

## `iconoma plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ iconoma plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ iconoma plugins unlink
  $ iconoma plugins remove

EXAMPLES
  $ iconoma plugins remove myplugin
```

## `iconoma plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ iconoma plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/reset.ts)_

## `iconoma plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ iconoma plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ iconoma plugins unlink
  $ iconoma plugins remove

EXAMPLES
  $ iconoma plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/uninstall.ts)_

## `iconoma plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ iconoma plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ iconoma plugins unlink
  $ iconoma plugins remove

EXAMPLES
  $ iconoma plugins unlink myplugin
```

## `iconoma plugins update`

Update installed plugins.

```
USAGE
  $ iconoma plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/update.ts)_
<!-- commandsstop -->
