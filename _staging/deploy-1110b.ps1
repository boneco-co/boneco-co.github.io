# 11/10 저녁 수정 한 번에 올리기 — ① 민원 현장앱(field.html) ② 종합예방관리대장(부장님 저장소)
$ErrorActionPreference = 'Stop'
$base = 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging'
# ① 민원처리앱 — 현장 화면 보기 모드 + [🗂 관리대장]
Write-Host '① 민원처리앱 폴더 찾는 중...'
$rc = Get-ChildItem -Path 'D:\','C:\Users' -Filter '.firebaserc' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 |
      Where-Object { (Get-Content $_.FullName -Raw) -match 'boneco-minwon' } | Select-Object -First 1
if (-not $rc) { Write-Host '민원처리앱 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
$dir = $rc.DirectoryName; $fj = Get-Content (Join-Path $dir 'firebase.json') -Raw | ConvertFrom-Json; $pub = Join-Path $dir $fj.hosting.public
$f = Join-Path $pub 'field.html'
if ((Get-FileHash $f -Algorithm SHA256).Hash.ToLower() -ne 'be22bdbd88d9cb359677cb8eb026c5878fc0618b050c60d7f90f90ce421c33cd') { Write-Host 'field.html 이 사이트와 달라서 멈춥니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
Copy-Item $f "$f.bak1110b" -Force
Invoke-WebRequest -UseBasicParsing "$base/minwon/field.html?v=1110b" -OutFile $f
Set-Location $dir; firebase.cmd deploy --only hosting
# ② 종합예방관리대장
Write-Host '② 부장님 저장소 폴더 찾는 중...'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 |
     Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
if (-not $g) { Write-Host '부장님 저장소 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
Set-Location (Split-Path $g.FullName -Parent)
if (-not (git config user.email)) { git config user.name '본에코'; git config user.email 'boneco-co@users.noreply.github.com' }
git am --abort 2>$null
git pull --ff-only
$p = Join-Path $env:TEMP 'boss-1110b.patch'
Invoke-WebRequest -UseBasicParsing "$base/boss-1110b.patch?v=1" -OutFile $p
git am --3way $p
if ($LASTEXITCODE -ne 0) { git am --abort; Write-Host '부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
Write-Host '✅ 둘 다 올림 완료' -ForegroundColor Green
