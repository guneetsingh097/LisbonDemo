param(
  [Parameter(Mandatory = $true)][string]$SourceDirectory
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $root 'images-bridge'
$manifest = Get-Content -LiteralPath (Join-Path $SourceDirectory 'sources.json') -Raw | ConvertFrom-Json
$photos = @($manifest.files | Where-Object file -ne 'Illustration.jpg')
if ($photos.Count -ne 14) { throw 'Expected the 14 selected source photographs.' }
if ($photos | Where-Object original) { throw 'Use the original source manifest, not previously resized derivatives.' }
$sourceBytes = ($photos | Measure-Object bytes -Sum).Sum
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]95)
$records = @()
try {
  foreach ($photo in $photos) {
    $source = Join-Path $SourceDirectory $photo.file
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant() -ne $photo.sha256) {
      throw "Source hash mismatch: $($photo.file)"
    }
    $image = [System.Drawing.Image]::FromFile($source)
    try {
      $target = [long][Math]::Floor(100000000 * $photo.bytes / $sourceBytes)
      $low = 0.05
      $high = 0.99
      $best = $null
      for ($attempt = 0; $attempt -lt 10; $attempt++) {
        $scale = ($low + $high) / 2
        $width = [int][Math]::Round($image.Width * $scale)
        $height = [int][Math]::Round($image.Height * $scale)
        $bitmap = [System.Drawing.Bitmap]::new($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $stream = [System.IO.MemoryStream]::new()
        try {
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
          $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
          $graphics.Clear([System.Drawing.Color]::White)
          $graphics.DrawImage($image, 0, 0, $width, $height)
          $bitmap.Save($stream, $codec, $parameters)
          if ($stream.Length -le $target) {
            $best = @{ data = $stream.ToArray(); width = $width; height = $height }
            $low = $scale
          } else {
            $high = $scale
          }
        } finally {
          $stream.Dispose()
          $graphics.Dispose()
          $bitmap.Dispose()
        }
      }
      if ($null -eq $best) { throw "Unable to resize $($photo.file) within its budget." }
      $outputPath = Join-Path $destination $photo.file
      $temporaryPath = "$outputPath.resizing"
      [System.IO.File]::WriteAllBytes($temporaryPath, $best.data)
      [System.IO.File]::Move($temporaryPath, $outputPath, $true)
      $records += [pscustomobject][ordered]@{
        file = $photo.file
        bytes = $best.data.Length
        sha256 = (Get-FileHash -LiteralPath (Join-Path $destination $photo.file) -Algorithm SHA256).Hash.ToLowerInvariant()
        width = $best.width
        height = $best.height
        original = $photo
      }
      Write-Output "$($photo.file): $($best.width)x$($best.height), $($best.data.Length) bytes"
    } finally {
      $image.Dispose()
    }
  }
} finally {
  $parameters.Dispose()
}
$total = ($records | Measure-Object bytes -Sum).Sum
if ($total -lt 98000000 -or $total -gt 100000000) { throw "Unexpected combined size: $total" }
$records = @($records | Sort-Object bytes -Descending) + @($manifest.files | Where-Object file -eq 'Illustration.jpg')
$output = [ordered]@{
  source = $manifest.source
  note = 'Resized derivatives of the same 14 largest supplied JPEGs, targeting 100 MB combined. Illustration unchanged. No licensing or ownership claim is made by this manifest.'
  processing = 'Windows System.Drawing high-quality bicubic resize, aspect ratio preserved, JPEG quality 95. Per-image byte budgets proportional to original sizes; no crop.'
  targetBytes = 100000000
  files = $records
}
$output | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $destination 'sources.json') -Encoding utf8NoBOM
Write-Output "Combined photographs: $total bytes"
