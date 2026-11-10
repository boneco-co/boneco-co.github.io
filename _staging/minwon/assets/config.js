// 앱 설정값 — 업체·서버가 바뀌면 이 파일만 고친다.
// firebase 값은 비밀번호가 아니다 (앱이 어느 Firebase에 연결할지 알려주는 공개 값).
// 보안은 로그인 + database.rules.json 이 담당한다.
window.MW_CONFIG = {
  appName: '본에코 민원처리',
  appVer: 'v1110a',                       // [11_3] 화면 머리글에 보이는 버전 (배포 후 확인용)
  company: 'boneco',                       // 업체코드 — 모든 데이터가 c/boneco/… 아래에 저장된다
  companyName: '본에코(주)',

  firebase: {
    apiKey: 'AIzaSyCtSh3rJysDrS8zGUkFJ40D9DzaBByCu-A',
    authDomain: 'boneco-minwon.firebaseapp.com',
    databaseURL: 'https://boneco-minwon-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'boneco-minwon',
    storageBucket: 'boneco-minwon.firebasestorage.app',   // 무료 요금제라 사용하지 않음 (사진은 DB에)
    messagingSenderId: '577084575402',
    appId: '1:577084575402:web:0d9a1b85f489f261eb0ad3'
  },

  // 로그인 계정의 내부 이메일 주소 끝부분 (실제 메일함 아님)
  authEmailDomain: 'boneco-minwon.firebaseapp.com',
  devKey: 'dev',                            // 프로그램 관리자 계정 키 → dev@boneco-minwon.firebaseapp.com

  // 하루 다시 로그인 시각 (R-38). 사무실·관리자는 날짜가 바뀌면.
  reset: { day: 5, night: 17 },

  // [10_28] 다른 앱으로 가는 전환 버튼 — 각 앱 주소는 그대로 쓴다
  //   사무실·관리자: 📒 디지털원장 / 관리자: ⚠️ 사고위험관리 / 현장 기동반·대형팀: 🚛 수거앱
  links: {
    wonjang: 'https://boneco-co.github.io/digit-wonjang/',
    sugeo: 'https://boneco-co.github.io/sugeorapp/',
    risk: 'https://bongsuk0708.github.io/minwon/report/'   // 사고위험관리(부장님 앱, 저장소 bongsuk0708/minwon 의 report 폴더) — 비우면 버튼이 안 보인다
  },

  // 시범(테스트) 기간 잠금: true면 "테스트 중" 안내만 보이고 로그인할 수 없다 (프로그램 관리자 로그인은 열림).
  // 시험하는 폰·PC는 한 번 https://boneco-minwon.web.app/?tester=1 로 열면 그 기기만 계속 열린다 (?tester=0 으로 다시 잠금).
  // 실제 사용을 시작하면 false 로 바꾼다.
  testMode: true,
  sugeoTeams: ['day', 'large'],   // 수거앱도 쓰는 팀 (기동반·대형팀)

  // [11_6] 야간팀 폰 푸시 알림 — 클라우드플레어 Worker(push-worker 폴더)가 15분마다 보낸다. 공개키는 비밀값이 아니다.
  push: {
    worker: 'https://boneco-push.boneco6221.workers.dev',
    vapidPublic: 'BOoZNomn91uowPNtLYaeKrcpcxtDDomhaE7MIEu2Fu6SNtf6ldwKzbGrfkettMZkUX6sld4_0jWGeUtt4_VvEE8'
  },

  // 카카오 (대형폐기물수거앱 키 공유 — 원장·수거앱과 같음)
  kakao: {
    jsKey: 'b8908c96799936ef733a0445f1bd6abc',
    restKey: '3c1012691c2c9f444b70b2c4ce936c98'
  }
};
