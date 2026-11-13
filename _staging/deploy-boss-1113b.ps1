# 종합예방관리대장 올리기 (부장님 저장소, v1113a fc270ba 위) — 이미 올라가 있으면 건너뜀
$ProgressPreference = 'SilentlyContinue'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
if (-not $g) { Write-Host '부장님 저장소 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
Set-Location (Split-Path $g.FullName -Parent)
git pull --ff-only
$log = git log --oneline -40 | Out-String
if ($log -match 'v1113b') { Write-Host '✅ 이미 올라가 있습니다 — 건너뜀' -ForegroundColor Green; return }
$p = Join-Path $env:TEMP 'boss-1113b.patch'; curl.exe -sL -o $p 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1113b.patch?v=1113b'
git am --3way $p
if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '❌ 부장님 새 수정과 겹쳐서 멈췄습니다 (저장소는 원래대로). 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
if ($LASTEXITCODE -ne 0) { Write-Host '❌ push 실패 — 로그인 창이 뜨면 로그인 후 다시 실행' -ForegroundColor Red; return }
Write-Host '✅ 종합예방관리대장 v1113b 올림 완료' -ForegroundColor Green
