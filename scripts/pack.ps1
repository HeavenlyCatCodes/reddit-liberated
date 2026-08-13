# Build Chrome and Firefox release zips for Reddit Liberated.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $root "manifest.json") -Raw | ConvertFrom-Json
$version = $manifest.version
$dist = Join-Path $root "dist"

$files = @(
  "manifest.json",
  "content.js",
  "content.css",
  "popup.html",
  "popup.css",
  "popup.js",
  "icons"
)

New-Item -ItemType Directory -Force -Path $dist | Out-Null

function New-ExtensionZip {
  param(
    [string]$Browser,
    [string]$InstallText
  )

  $staging = Join-Path $dist "staging-$Browser"
  if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $staging | Out-Null

  foreach ($item in $files) {
    $from = Join-Path $root $item
    $to = Join-Path $staging $item
    Copy-Item -Path $from -Destination $to -Recurse
  }

  Set-Content -Path (Join-Path $staging "INSTALL.txt") -Value $installText -Encoding UTF8

  $zipName = "reddit-liberated-$Browser-$version.zip"
  $zipPath = Join-Path $dist $zipName
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

  Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -CompressionLevel Optimal
  Remove-Item $staging -Recurse -Force
  Write-Host "Wrote $zipPath"
}

$chromeInstall = @"
Reddit Liberated $version — Chrome, Edge, Brave, Arc
=====================================================

1. Unzip this folder somewhere you will keep it (the extension loads from this path).
2. Open chrome://extensions  (or edge://extensions).
3. Turn on Developer mode (top right).
4. Click Load unpacked.
5. Select this unzipped folder (the one that contains manifest.json).
6. Open reddit.com. The login wall and ads should be gone.

Incognito: open the extension Details and enable Allow in Incognito.
"@

$firefoxInstall = @"
Reddit Liberated $version — Firefox
===================================

1. Unzip this folder, or keep the zip as-is.
2. Open about:debugging#/runtime/this-firefox
3. Click Load Temporary Add-on...
4. Choose manifest.json from the unzipped folder, or choose this zip.
5. Open reddit.com. The login wall and ads should be gone.

Firefox removes temporary add-ons when you quit the browser.
Load this zip again after a restart.
"@

New-ExtensionZip -Browser "chrome" -InstallText $chromeInstall
New-ExtensionZip -Browser "firefox" -InstallText $firefoxInstall
