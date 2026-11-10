# 민원처리앱 office.html — 주소검색 스크립트 주소를 카카오 공식 주소로 (12/1 daumcdn 종료 대응)
$ErrorActionPreference = 'Stop'
$rc = Get-ChildItem -Path 'D:\','C:\Users' -Filter '.firebaserc' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content $_.FullName -Raw) -match 'boneco-minwon' } | Select-Object -First 1
$dir = $rc.DirectoryName; $fj = Get-Content (Join-Path $dir 'firebase.json') -Raw | ConvertFrom-Json; $f = Join-Path (Join-Path $dir $fj.hosting.public) 'office.html'
if ((Get-FileHash $f -Algorithm SHA256).Hash.ToLower() -ne 'f84d51c6c33d873373caa5ffc6e9aae213173f6f53879d1ebebeca0a9a567d18') { Write-Host 'office.html 이 사이트와 달라서 멈춥니다.' -ForegroundColor Red; return }
Copy-Item $f "$f.bak1110c" -Force
Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/minwon/office.html?v=1' -OutFile $f
Set-Location $dir; firebase.cmd deploy --only hosting
Write-Host '✅ 민원처리앱 주소검색 주소 바꿈 완료' -ForegroundColor Green
