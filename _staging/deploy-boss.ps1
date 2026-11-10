# 종합예방관리대장(부장님 저장소 bongsuk0708/minwon) 11/10 수정 올리기 — 사무실 PC에서 한 번 실행
$ErrorActionPreference = 'Stop'
Write-Host '부장님 저장소 폴더 찾는 중...'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 |
     Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
if (-not $g) { Write-Host '부장님 저장소 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
$dir = Split-Path $g.FullName -Parent
Set-Location $dir; Write-Host "폴더: $dir"
if (-not (git config user.email)) { git config user.name '본에코'; git config user.email 'boneco-co@users.noreply.github.com' }   # 이 저장소에만
git am --abort 2>$null
git pull --ff-only
$p = Join-Path $env:TEMP 'boss-1110.patch'
Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1110.patch' -OutFile $p
git am --3way $p
if ($LASTEXITCODE -ne 0) { git am --abort; Write-Host '부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
Write-Host '✅ 종합예방관리대장 올림 완료' -ForegroundColor Green
