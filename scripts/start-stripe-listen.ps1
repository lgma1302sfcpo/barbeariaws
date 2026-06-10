$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
$stripePath = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe'

if (-not (Test-Path -LiteralPath $stripePath)) {
  $stripeCommand = Get-Command stripe -ErrorAction SilentlyContinue
  if (-not $stripeCommand) {
    throw 'Stripe CLI nao encontrado.'
  }

  $stripePath = $stripeCommand.Source
}

if (-not (Test-Path -LiteralPath $envPath)) {
  throw '.env nao encontrado.'
}

Get-Content -LiteralPath $envPath | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') {
    return
  }

  $parts = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($parts[0], $parts[1], 'Process')
}

if (-not $env:STRIPE_SECRET_KEY) {
  throw 'STRIPE_SECRET_KEY nao configurada no .env.'
}

$env:STRIPE_API_KEY = $env:STRIPE_SECRET_KEY

& $stripePath listen `
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired `
  --forward-to localhost:4242/api/webhooks/stripe
