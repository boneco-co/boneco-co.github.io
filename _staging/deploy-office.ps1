# 민원처리앱 office.html — 주소검색 스크립트 주소를 카카오 공식 주소로 (12/1 daumcdn 종료 대응)
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$rc = Get-ChildItem -Path 'D:\','C:\Users' -Filter '.firebaserc' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content $_.FullName -Raw) -match 'boneco-minwon' } | Select-Object -First 1
$dir = $rc.DirectoryName; $fj = Get-Content (Join-Path $dir 'firebase.json') -Raw | ConvertFrom-Json; $f = Join-Path (Join-Path $dir $fj.hosting.public) 'office.html'
$h = (Get-FileHash $f -Algorithm SHA256).Hash.ToLower()
if ($h -eq 'b862f1acf37b6ddace6ec71527fe564413e28fe1a6951fda217f65d7197f907c') { Write-Host '이미 새 파일입니다 — 배포만 합니다.' }
else {
  if ($h -ne 'f84d51c6c33d873373caa5ffc6e9aae213173f6f53879d1ebebeca0a9a567d18') { if (Test-Path "$f.bak1110c") { Copy-Item "$f.bak1110c" $f -Force } else { Write-Host 'office.html 이 사이트와 달라서 멈춥니다.' -ForegroundColor Red; return } }
  Copy-Item $f "$f.bak1110c" -Force
  $tmp = Join-Path $env:TEMP 'office_new.html'
  curl.exe -sL -o $tmp 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/minwon/office.html'
  if ((Get-FileHash $tmp -Algorithm SHA256).Hash.ToLower() -ne 'b862f1acf37b6ddace6ec71527fe564413e28fe1a6951fda217f65d7197f907c') { Write-Host '받은 파일이 달라서 멈춥니다.' -ForegroundColor Red; return }
  Copy-Item $tmp $f -Force
}
Set-Location $dir; firebase.cmd deploy --only hosting
Write-Host '✅ 민원처리앱 주소검색 주소 바꿈 완료' -ForegroundColor Green
