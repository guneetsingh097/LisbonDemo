param(
  [Parameter(Mandatory = $true)][string]$FFmpeg,
  [string]$DownloadsDirectory = (Join-Path $env:USERPROFILE 'Downloads')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$provenance = Get-Content -LiteralPath (Join-Path $root 'images-getty\provenance.json') -Raw | ConvertFrom-Json
$ids = '1172009391', '183584154', '945023048', '1354751821', '1277370721', '2190480336'
$outputDirectory = Join-Path $root 'images-pilot'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]95)
$records = @()
try {
  foreach ($id in $ids) {
    $asset = $provenance.assets | Where-Object id -eq $id
    if (!$asset -or $asset.licenseType -ne 'Royalty-free' -or $asset.assetFamily -ne 'Creative') {
      throw "Missing verified Creative royalty-free provenance: $id"
    }
    $original = Join-Path $DownloadsDirectory $asset.original.name
    if ((Get-FileHash -LiteralPath $original -Algorithm SHA256).Hash.ToLowerInvariant() -ne $asset.original.sha256) {
      throw "Original differs from the verified licensed download: $id"
    }
    $image = [System.Drawing.Image]::FromFile($original)
    try {
      if ($image.Width -ne $asset.original.width -or $image.Height -ne $asset.original.height) {
        throw "Original dimensions differ from provenance: $id"
      }
      $bitmap = [System.Drawing.Bitmap]::new($image.Width, $image.Height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.DrawImage($image, [System.Drawing.Rectangle]::new(0, 0, $image.Width, $image.Height),
          0, 0, $image.Width, $image.Height, [System.Drawing.GraphicsUnit]::Pixel)
        $file = "images-pilot/GettyImages-$id-full.jpg"
        $path = Join-Path $root ($file.Replace('/', '\'))
        $bitmap.Save($path, $codec, $parameters)
        $records += [pscustomobject][ordered]@{
          id = $id; title = $asset.title; credit = $asset.credit; source = $asset.source
          file = $file; width = $image.Width; height = $image.Height
          bytes = (Get-Item -LiteralPath $path).Length
          sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
          originalSha256 = $asset.original.sha256
          licenseType = 'Royalty-free'; assetFamily = 'Creative'
          detailPageRecheckedOn = '2026-10-25'; editorialOnlyNoticeObserved = $false
          evidence = 'Existing individual non-editorial checks and completed agreement downloads: images-getty/provenance.json'
        }
      } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
      }
    } finally {
      $image.Dispose()
    }
  }
} finally {
  $parameters.Dispose()
}
$originalVideo = Join-Path $DownloadsDirectory 'GettyImages-1479976095.mov'
$videoFile = 'videos/getty-surf-1479976095.mp4'
$videoPath = Join-Path $root ($videoFile.Replace('/', '\'))
& $FFmpeg -hide_banner -loglevel error -y -i $originalVideo -map 0:v:0 -c:v copy -an -movflags +faststart $videoPath
if ($LASTEXITCODE -ne 0) { throw 'Licensed surf-film MP4 remux failed.' }
$poster = 'images-pilot/getty-surf-1479976095-poster.jpg'
& $FFmpeg -hide_banner -loglevel error -y -ss 1 -i $videoPath -frames:v 1 -vf 'scale=1280:-2' -q:v 3 (Join-Path $root ($poster.Replace('/', '\')))
if ($LASTEXITCODE -ne 0) { throw 'Surf-film poster extraction failed.' }
$video = [pscustomobject][ordered]@{
  id = '1479976095'; title = 'Walking with surfboard on the beach.'
  credit = 'ArtistGNDphotography / Getty Images'
  source = 'https://www.gettyimages.com/detail/video/walking-with-surfboard-on-the-beach-stock-footage/1479976095'
  file = $videoFile; poster = $poster; width = 1920; height = 1080
  bytes = (Get-Item -LiteralPath $videoPath).Length
  sha256 = (Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash.ToLowerInvariant()
  originalSha256 = (Get-FileHash -LiteralPath $originalVideo -Algorithm SHA256).Hash.ToLowerInvariant()
  licenseType = 'Royalty-free'; assetFamily = 'Creative'; releaseInfo = 'Model released'
  downloadedOn = '2026-10-25'; selectedFormat = 'HD H.264, 1920x1080, 24 fps, MOV, 83.3 MB'
  editorialOnlyNoticeObserved = $false
  evidence = 'Exact Creative ID, Royalty-free, model release and current agreement availability observed on the detail page before normal DOWNLOAD. DOWNLOAD AGAIN observed afterward; completed local MOV independently inspected. No purchase, credits payment or new terms accepted.'
  processing = 'Lossless H.264 video-track remux to fast-start MP4; no re-encoding, artificial padding or added audio. One actual frame supplies the poster.'
}
$manifest = [ordered]@{
  scope = 'Local three-site pilot: hotel 1, restaurant directory 5, surf school 17. No publication authorized.'
  processing = 'JPEG quality 95 web derivatives at original pixel dimensions, without source metadata. Natural colours and aspect ratios retained; original licensed files remain outside Git.'
  licenseCaveat = 'Observed existing-agreement download access is not an independent legal review of confidential agreement terms. Royalty-free does not mean public domain or permission to redistribute source files.'
  photos = $records; video = $video
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $outputDirectory 'provenance.json') -Encoding utf8
$publicPhotos = $records | Select-Object id,title,credit,source,file,width,height
$publicVideo = $video | Select-Object id,title,credit,source,file,poster,width,height
$catalog = "// Generated by scripts/prepare-media-pilot.ps1 from independently verified licensed files.`n"
$catalog += "export const pilotPhotos = $($publicPhotos | ConvertTo-Json -Depth 4);`n"
$catalog += "export const pilotVideo = $($publicVideo | ConvertTo-Json -Depth 4);`n"
Set-Content -LiteralPath (Join-Path $root 'sites\media-pilot-catalog.js') -Value $catalog -Encoding utf8 -NoNewline
$records | Format-Table id,width,height,bytes
Write-Output "Surf-film MP4: $($video.bytes) bytes. Originals preserved outside Git."
