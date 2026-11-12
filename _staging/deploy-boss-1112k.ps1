# 종합예방관리대장 1112j·1112k 올리기 (부장님 저장소) — 이미 올라간 단계는 건너뛴다 (이어서 실행해도 안전)
$ProgressPreference = 'SilentlyContinue'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
if (-not $g) { Write-Host '부장님 저장소 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
Set-Location (Split-Path $g.FullName -Parent)
git pull --ff-only
$log = git log --oneline -40 | Out-String
if ($log -match 'v1112b') { Write-Host '✅ 1112k(v1112b)는 이미 올라가 있습니다 — 건너뜀' -ForegroundColor Green; git status -sb | Select-Object -First 1; return }
if ($log -notmatch '사고·민원대장 숫자칸') {
  $pj = Join-Path $env:TEMP 'boss-1112j.patch'; curl.exe -sL -o $pj 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1112j.patch?v=k'
  git am --3way $pj
  if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '1112j 묶음이 부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
  Write-Host '1112j 적용됨'
}
$p = Join-Path $env:TEMP 'boss-1112k.patch'; curl.exe -sL -o $p 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1112k.patch?v=k'
git am --3way $p
if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '1112k 묶음이 부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
if ($LASTEXITCODE -ne 0) { Write-Host '❌ push 실패 — 로그인 창이 뜨면 사용자가 로그인하고 다시 실행' -ForegroundColor Red; return }
Write-Host '✅ 종합예방관리대장 v1112b 올림 완료' -ForegroundColor Green
