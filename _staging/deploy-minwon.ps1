# 민원처리앱 v1110a 배포 (본에코) — 사무실 PC에서 한 번 실행
$ErrorActionPreference = 'Stop'
$base = 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/minwon'
Write-Host '민원처리앱 폴더 찾는 중...'
$rc = Get-ChildItem -Path 'D:\','C:\Users' -Filter '.firebaserc' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 |
      Where-Object { (Get-Content $_.FullName -Raw) -match 'boneco-minwon' } | Select-Object -First 1
if (-not $rc) { Write-Host '민원처리앱 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
$dir = $rc.DirectoryName
$fj = Get-Content (Join-Path $dir 'firebase.json') -Raw | ConvertFrom-Json
$pub = Join-Path $dir $fj.hosting.public
Write-Host "폴더: $pub"
$res = Join-Path $pub 'assets\results.js'
$h = (Get-FileHash $res -Algorithm SHA256).Hash.ToLower()
if ($h -ne '573a1e18a191300dce1db37251f65a7fac13bca558a82527fff74d1c0181991e') { Write-Host '이 PC의 파일이 사이트와 달라서 멈춥니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
foreach ($f in 'index.html','assets\results.js','assets\config.js') {
  $p = Join-Path $pub $f; Copy-Item $p "$p.bak1110" -Force
  Invoke-WebRequest -UseBasicParsing -Uri ("$base/" + ($f -replace '\\','/')) -OutFile $p
}
Set-Location $dir
firebase deploy --only hosting
$v = (Invoke-WebRequest -UseBasicParsing 'https://boneco-minwon.web.app/assets/config.js').Content
if ($v -match "v1110a") { Write-Host '✅ 배포 완료 v1110a' -ForegroundColor Green } else { Write-Host '사이트 버전 확인 실패' -ForegroundColor Yellow }
