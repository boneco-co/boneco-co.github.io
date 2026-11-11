# 11/11 수정 한 번에 올리기 — ① 민원처리앱 결과확인(사고관리앱 민원 보기) ② 종합예방관리대장(시안3·A)
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$base = 'https://raw.githubusercontent.com/boneco-co/boneco-co.github.io/staging-minwon/_staging'
Write-Host '① 민원처리앱...'
$rc = Get-ChildItem -Path 'D:\','C:\Users' -Filter '.firebaserc' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content $_.FullName -Raw) -match 'boneco-minwon' } | Select-Object -First 1
$dir = $rc.DirectoryName; $fj = Get-Content (Join-Path $dir 'firebase.json') -Raw | ConvertFrom-Json; $f = Join-Path (Join-Path $dir $fj.hosting.public) 'assets\results.js'
$h = (Get-FileHash $f -Algorithm SHA256).Hash.ToLower()
if ($h -ne '4fab1302d5418d3b55a18876009821762e9d540310078915726ad06f37be5250') {
  if ($h -ne '553763a3c855b4ab64f48122dd260de19f16422af197362bb90489907799e7c3') { Write-Host 'results.js 가 사이트와 달라서 멈춥니다.' -ForegroundColor Red; return }
  Copy-Item $f "$f.bak1111" -Force
  $tmp = Join-Path $env:TEMP 'results_1111.js'; curl.exe -sL -o $tmp "$base/minwon/assets/results.js?v=1111"
  if ((Get-FileHash $tmp -Algorithm SHA256).Hash.ToLower() -ne '4fab1302d5418d3b55a18876009821762e9d540310078915726ad06f37be5250') { Write-Host '받은 파일이 달라서 멈춥니다.' -ForegroundColor Red; return }
  Copy-Item $tmp $f -Force
}
Set-Location $dir; firebase.cmd deploy --only hosting
Write-Host '② 종합예방관리대장...'
$g = Get-ChildItem -Path 'D:\','C:\Users' -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 | Where-Object { (Get-Content (Join-Path $_.FullName 'config') -Raw -ErrorAction SilentlyContinue) -match 'bongsuk0708/minwon' } | Select-Object -First 1
Set-Location (Split-Path $g.FullName -Parent)
$ErrorActionPreference = 'Continue'
git pull --ff-only
$p = Join-Path $env:TEMP 'boss-1111.patch'; curl.exe -sL -o $p "$base/boss-1111.patch?v=1111"
git am --3way $p
if ($LASTEXITCODE -ne 0) { cmd /c "git am --abort"; Write-Host '부장님 새 수정과 겹쳐서 멈췄습니다. 통합방에 알려 주세요.' -ForegroundColor Red; return }
git push
Write-Host '✅ 11/11 둘 다 올림 완료' -ForegroundColor Green
