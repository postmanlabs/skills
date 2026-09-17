# Postman CLI Installation

## Install

**npm (all platforms):**

```bash
npm install -g postman-cli
```

**macOS, Linux, and WSL (curl):**

```bash
curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
```

**Windows (PowerShell):**

```powershell
powershell.exe -NoProfile -InputFormat None -ExecutionPolicy AllSigned -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://dl-cli.pstmn.io/install/win64.ps1'))"
```

## Update

To update an existing installation to the latest version, run the same
command used to install it.

## Uninstall

npm installations:

```bash
npm uninstall -g postman-cli
```

Other install methods: delete the `postman` binary from its install
directory (`%USERPROFILE%\AppData\Local\Microsoft\WindowsApps` on Windows,
`/usr/local/bin` on macOS/Linux/WSL).

Source: https://learning.postman.com/docs/postman-cli/postman-cli-installation/
