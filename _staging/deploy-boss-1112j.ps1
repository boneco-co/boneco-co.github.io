# 사고대장 등급칸·위치·상세창 수정 올리기 (부장님 저장소)
$ProgressPreference = 'SilentlyContinue'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
if (-not $g) { Write-Host '부장님 저장소 폴더를 못 찾았습니다.' -ForegroundColor Red; return }
Set-Location (Split-Path $g.FullName -Parent)
git pull --ff-only
$p = Join-Path $env:TEMP 'boss-1112j.patch'; curl.exe -sL -o $p 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging/boss-1112j.patch?v=j'
git am --3way $p
if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
Write-Host '✅ 사고·민원대장·지도 뭉치기·제목·분류 올림 완료' -ForegroundColor Green
