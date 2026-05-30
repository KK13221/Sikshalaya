# build_and_deploy.ps1
# Automates Flutter release building, version incrementing, custom naming, and Android deployment.

$ErrorActionPreference = "Stop"

# 1. Load or initialize build number
$buildFile = "build_number.txt"
$buildNumber = 1
if (Test-Path $buildFile) {
    $buildNumber = [int](Get-Content $buildFile).Trim()
}

# 2. Extract version from pubspec.yaml
$pubspec = Get-Content "pubspec.yaml" -Raw
$version = "0.1.0"
if ($pubspec -match "version:\s*([^\s]+)") {
    $version = $Matches[1]
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Building Sikshalaya Teacher App v$version" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 3. Compile the production APK
Write-Host "Compiling release APK..." -ForegroundColor Yellow
flutter build apk --release

# 4. Copy to versioned filename
$sourceApk = "build\app\outputs\flutter-apk\app-release.apk"
$destVersionedApk = "shikshalaya_teacher_app_v$($version).apk"
$destLatestApk = "shikshalaya_teacher_app_latest.apk"

if (Test-Path $sourceApk) {
    Copy-Item -Path $sourceApk -Destination $destVersionedApk -Force
    Copy-Item -Path $sourceApk -Destination $destLatestApk -Force
    Write-Host "Success: Generated versioned package: $destVersionedApk" -ForegroundColor Green
    Write-Host "Success: Copied to alias: $destLatestApk" -ForegroundColor Green
} else {
    Write-Error "Could not find built APK at $sourceApk"
}

# 5. Increment build number for next run
$nextBuild = $buildNumber + 1
$nextBuild | Out-File $buildFile -NoNewline
Write-Host "Success: Incremented build number to #$nextBuild" -ForegroundColor Green

# 6. Check and deploy to connected Android devices
Write-Host "Checking for connected Android devices..." -ForegroundColor Yellow
$adbPath = "E:\AI\testantigravity\SmartshakerUI\android-sdk\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    $devices = & $adbPath devices
    $onlineDevice = $false
    foreach ($line in $devices) {
        if ($line -match "([A-Za-z0-9_.-]+)\s+device$") {
            $deviceId = $Matches[1]
            $onlineDevice = $true
            Write-Host "Found active device: $deviceId. Installing $destVersionedApk..." -ForegroundColor Cyan
            & $adbPath -s $deviceId install -r $destVersionedApk
            Write-Host "Success: Installation success! Launching app..." -ForegroundColor Green
            & $adbPath -s $deviceId shell monkey -p com.example.studentlens_teacher_app -c android.intent.category.LAUNCHER 1
            break
        }
    }
    if (-not $onlineDevice) {
        Write-Host "Warning: No online Android devices detected. Skipping installation." -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: ADB not found at expected path. Skipping installation." -ForegroundColor Yellow
}

Write-Host "======================================================" -ForegroundColor Green
Write-Host "BUILD AND DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
