param(
    [Parameter(Mandatory = $true)]
    [string]$Config,

    [string]$SourceRoot = "C:\Users\24045\Desktop\dynamic geometry optimization",

    [switch]$Confirmed
)

$ErrorActionPreference = "Stop"

if (-not $Confirmed) {
    throw "Import cancelled. Review the source directory, then rerun with -Confirmed."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$configPath = if ([System.IO.Path]::IsPathRooted($Config)) { $Config } else { Join-Path $repositoryRoot $Config }
$paper = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$sourceDirectory = Join-Path $SourceRoot $paper.source.directory
$destinationDirectory = Join-Path $repositoryRoot (Join-Path "paper-source" $paper.source.directory)

if (-not (Test-Path -LiteralPath (Join-Path $sourceDirectory $paper.source.tex))) {
    throw "Configured TeX entry point was not found: $sourceDirectory\$($paper.source.tex)"
}

$stagingDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("paper-import-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $stagingDirectory | Out-Null

foreach ($relativePath in $paper.source.include) {
    $sourceItem = Join-Path $sourceDirectory $relativePath
    if (-not (Test-Path -LiteralPath $sourceItem)) { throw "Configured source item was not found: $sourceItem" }
    $destinationItem = Join-Path $stagingDirectory $relativePath
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destinationItem) | Out-Null
    Copy-Item -LiteralPath $sourceItem -Destination $destinationItem -Recurse
}

New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
& robocopy $stagingDirectory $destinationDirectory /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -gt 7) { throw "Paper import failed with robocopy exit code $LASTEXITCODE." }

$sharedBibliography = Join-Path $SourceRoot "bibliography"
if (Test-Path -LiteralPath $sharedBibliography) {
    $bibliographyTarget = Join-Path $repositoryRoot "paper-source\bibliography"
    New-Item -ItemType Directory -Force -Path $bibliographyTarget | Out-Null
    & robocopy $sharedBibliography $bibliographyTarget /E /PURGE /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -gt 7) { throw "Bibliography import failed with robocopy exit code $LASTEXITCODE." }
}

Write-Output "Imported $($paper.slug) from $sourceDirectory"
Write-Output "Review $destinationDirectory before committing or pushing."
