$ftpHost = "ftpupload.net"
$ftpUser = "ezyro_41221002"
$ftpPass = "3e24bd5"
$baseDir = "C:\xampp\htdocs\invoice\dist"
$remoteRoot = "ftp://$ftpHost/htdocs/invoice"

function Upload-File($localPath, $remotePath) {
    Write-Host "Uploading $localPath to $remotePath"
    try {
        $ftpReq = [System.Net.FtpWebRequest]::Create($remotePath)
        $ftpReq.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpReq.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpReq.UsePassive = $true
        $ftpReq.UseBinary = $true
        
        $fileBytes = [System.IO.File]::ReadAllBytes($localPath)
        $ftpReq.ContentLength = $fileBytes.Length
        $reqStream = $ftpReq.GetRequestStream()
        $reqStream.Write($fileBytes, 0, $fileBytes.Length)
        $reqStream.Close()
    } catch {
        Write-Error "Failed to upload $($localPath): $($_.Exception.Message)"
    }
}

# Upload index.html
Upload-File "$baseDir\index.html" "$remoteRoot/index.html"

# Upload assets
$assets = Get-ChildItem -Path "$baseDir\assets" -File
foreach ($asset in $assets) {
    Upload-File $asset.FullName "$remoteRoot/assets/$($asset.Name)"
}

Write-Host "Update complete!"
