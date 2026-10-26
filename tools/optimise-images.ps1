# Re-encode photography as compact JPEGs (team portraits 800 px wide, editorial images 1600 px wide).
# Usage: powershell -NoProfile -File tools/optimise-images.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L

function Save-Jpeg($src, $dst, $maxW) {
  $img = [System.Drawing.Image]::FromFile($src)
  $w = [Math]::Min($maxW, $img.Width)
  $h = [int]([double]$img.Height * $w / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  $img.Dispose()
  $bmp.Save($dst, $codec, $params)
  $g.Dispose(); $bmp.Dispose()
  Write-Output ("{0} -> {1} ({2}x{3})" -f (Split-Path $src -Leaf), (Split-Path $dst -Leaf), $w, $h)
}

Get-ChildItem "$root/assets/img/team/*.png" | ForEach-Object {
  Save-Jpeg $_.FullName ($_.FullName -replace '\.png$', '.jpg') 800
  Remove-Item $_.FullName
}
Get-ChildItem "$root/assets/img/news/*.jpg" | ForEach-Object {
  $tmp = $_.FullName + '.tmp.jpg'
  Save-Jpeg $_.FullName $tmp 1600
  Move-Item -Force $tmp $_.FullName
}
