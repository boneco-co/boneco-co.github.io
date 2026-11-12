# 종합예방관리대장 1112k 올리기 (부장님 저장소) — 1112j(사고·민원대장 묶음)가 아직 안 올라갔으면 그것부터 같이 얹는다
$ProgressPreference = 'SilentlyContinue'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
if (-not $g) { Write-Host '부장님 저장소 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
Set-Location (Split-Path $g.FullName -Parent)
git pull --ff-only
$hasJ = git log --oneline -30 | Select-String '사고·민원대장 숫자칸'
if (-not $hasJ) {
  $pj = Join-Path $env:TEMP 'boss-1112j.patch'; curl.exe -sL -o $pj 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1112j.patch?v=k'
  git am --3way $pj
  if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '1112j 묶음이 부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
}
$p = Join-Path $env:TEMP 'boss-1112k.patch'; curl.exe -sL -o $p 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1112k.patch?v=k'
git am --3way $p
if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '1112k 묶음이 부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
Write-Host '✅ 종합예방관리대장 v1112b(주소 통일·기간 설정·민원 색·사고 목록·RFID·감량·같은 주소 핀) 올림 완료' -ForegroundColor Green
