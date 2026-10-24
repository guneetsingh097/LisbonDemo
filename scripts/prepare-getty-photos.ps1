param(
  [Parameter(Mandatory = $true)][string]$MetadataOutput,
  [string]$DownloadsDirectory = (Join-Path $env:USERPROFILE 'Downloads')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assets = node --input-type=module -e "import {candidates} from './scripts/getty-photo-plan.mjs';console.log(JSON.stringify(candidates));" | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Cannot read Getty candidate metadata.' }
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]85)
$records = @()
foreach ($asset in $assets) {
  $originalPath = Join-Path $DownloadsDirectory "GettyImages-$($asset.id).jpg"
  $originalFile = Get-Item -LiteralPath $originalPath
  $image = [System.Drawing.Image]::FromFile($originalPath)
  try {
    if ($image.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid) { throw "Original is not JPEG: $originalPath" }
    $scale = [Math]::Min(1.0, [double]1600 / [Math]::Max($image.Width, $image.Height))
    $width = [int][Math]::Round($image.Width * $scale)
    $height = [int][Math]::Round($image.Height * $scale)
    $bitmap = [System.Drawing.Bitmap]::new($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($image, 0, 0, $width, $height)
      $relative = "images-getty/GettyImages-$($asset.id)-1600.jpg"
      $output = Join-Path (Get-Location) ($relative.Replace('/', '\'))
      $bitmap.Save($output, $codec, $parameters)
      $records += [pscustomobject]@{
        id = $asset.id
        file = $relative
        width = $width
        height = $height
        bytes = (Get-Item -LiteralPath $output).Length
        sha256 = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
        original = @{
          name = $originalFile.Name
          width = $image.Width
          height = $image.Height
          bytes = $originalFile.Length
          sha256 = (Get-FileHash -LiteralPath $originalPath -Algorithm SHA256).Hash.ToLowerInvariant()
        }
      }
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  } finally {
    $image.Dispose()
  }
}
$parameters.Dispose()
$records | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $MetadataOutput -Encoding utf8
Write-Output "Verified and prepared $($records.Count) Getty originals; metadata: $MetadataOutput"
