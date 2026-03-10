# CLAY Minimal Installer for Windows (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

$BinaryLocalSource = Join-Path $ScriptDir "bin\clay-sandbox-windows-amd64.exe"
$BinaryUrl = "https://raw.githubusercontent.com/UIZorrot/Clay-Skill-More/main/bin/clay-sandbox-windows-amd64.exe"
$BinaryTarget = Join-Path $ScriptDir "clay-sandbox.exe"

# 1. Prepare Binary
if (!(Test-Path $BinaryTarget)) {
    if (Test-Path $BinaryLocalSource) {
        Copy-Item -Path $BinaryLocalSource -Destination $BinaryTarget
    }
    else {
        Write-Host "Downloading Sandbox Binary from $BinaryUrl ..."
        Invoke-WebRequest -Uri $BinaryUrl -OutFile $BinaryTarget
    }
}

# 2. Configure Environment
$EnvFile = ".env.clay"
$Token = [System.Convert]::ToBase64String((1..18 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 255) })) -replace "[+\/]", ""
$BasePort = 9000
$Port = $BasePort
while ($true) {
    if (-not (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue)) {
        break
    }
    $Port++
}
$ListenAddr = "127.0.0.1:$Port"

$RelayUrl = $env:RELAY_URL
if ([string]::IsNullOrWhiteSpace($RelayUrl)) {
    $RelayUrl = "https://api.wallet.bitslab.xyz"
}

$EnvContent = @"
CLAY_SANDBOX_URL=http://$ListenAddr
CLAY_AGENT_TOKEN=$Token
CLAY_RELAY_URL=$RelayUrl
"@
Set-Content -Path $EnvFile -Value $EnvContent -Encoding UTF8

# 3. Launch Daemon
Stop-Process -Name "clay-sandbox" -ErrorAction SilentlyContinue
Start-Process -FilePath $BinaryTarget -WindowStyle Hidden -Environment @{
    "RELAY_URL"   = $RelayUrl
    "LISTEN_ADDR" = $ListenAddr
    "AGENT_TOKEN" = $Token
    "AGENT_ID"    = "openclaw-agent-$(Get-Random)"
}

Write-Host "✅ CLAY Sandbox is running on $ListenAddr"
Write-Host "✅ Identity Token generated and saved to $EnvFile"
