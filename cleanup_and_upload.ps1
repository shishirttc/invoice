$ftpHost = "ftpupload.net"
$ftpUser = "ezyro_41221002"
$ftpPass = "3e24bd5"
$baseDir = "C:\xampp\htdocs\invoice\dist"
$rootFtp = "ftp://$ftpHost/htdocs"
$invoiceFtp = "ftp://$ftpHost/htdocs/invoice"

function Delete-FtpFile($url) {
    Write-Host "Deleting $url"
    try {
        $ftpReq = [System.Net.FtpWebRequest]::Create($url)
        $ftpReq.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpReq.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
        $ftpReq.UsePassive = $true
        $ftpReq.GetResponse().Close()
    } catch {
        Write-Host "Warning: Could not delete $url"
    }
}

function Create-FtpDir($url) {
    Write-Host "Creating directory $url"
    try {
        $ftpReq = [System.Net.FtpWebRequest]::Create($url)
        $ftpReq.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpReq.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $ftpReq.UsePassive = $true
        $ftpReq.GetResponse().Close()
    } catch {
        Write-Host "Warning: $url might already exist"
    }
}

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

# 1. Delete from root
Delete-FtpFile "$rootFtp/index.html"
Delete-FtpFile "$rootFtp/api.php"
Delete-FtpFile "$rootFtp/.htaccess"

# 2. Setup invoice dir
Create-FtpDir $invoiceFtp
Create-FtpDir "$invoiceFtp/assets"

# 3. Upload files to invoice dir
Upload-File "$baseDir\index.html" "$invoiceFtp/index.html"
Upload-File "$baseDir\api.php" "$invoiceFtp/api.php"
Upload-File "$baseDir\.htaccess" "$invoiceFtp/.htaccess"

$assets = Get-ChildItem -Path "$baseDir\assets" -File
foreach ($asset in $assets) {
    Upload-File $asset.FullName "$invoiceFtp/assets/$($asset.Name)"
}

Write-Host "Re-deployment to /invoice/ complete!"
