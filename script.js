// DOMContentLoaded 이벤트: HTML 파싱 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
  
    // 내비게이션 링크에 각각 클릭 이벤트 부여
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();  // a 태그 기본 링크 이동을 막고 SPA처럼 동작하도록 함
        
        // 모든 nav-link에서 active 클래스 제거
        navLinks.forEach(ln => ln.classList.remove('active'));
        // 클릭된 링크에 active 클래스 추가
        link.classList.add('active');
  
        // 모든 섹션을 숨긴 후
        sections.forEach(section => section.classList.add('hidden'));
  
        // data-page 속성 값을 통해 해당 섹션만 보이도록 처리
        const pageId = link.getAttribute('data-page');
        const targetSection = document.getElementById(pageId);
        if (targetSection) {
          targetSection.classList.remove('hidden');
        }
      });
    });
  
    // 페이지 로드시 기본적으로 About 섹션을 표시
    document.getElementById('about').classList.remove('hidden');
  });
  