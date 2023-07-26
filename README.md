
# 랩삐 


## Architecture

- **database**: sqlite 데이터베이스
- **public**: 클라이언트에서 접근 가능한 리소스
    - **images**
    - **scripts**: src/javascripts 의 빌드 결과물
    - **styles**: 페이지별 css
- **src**: 어플리케이션 코드
    - **javascripts**
        - **games**: 게임 소스코드
        - **utils**
    - **pipes**: 라우팅/로그인 등 처리를 위한 서버 측 컨트롤러
    - **views**: 웹페이지 템플릿
        - **games**
            - **01.ejs**
            - **02.ejs**
            - **03.ejs**
        - **_footer.ejs**
        - **_header.ejs**
        - **dashboard.ejs**: 로그인 정보 있을 시 홈화면
        - **signup.ejs**: 로그인 정보 없을 시 홈화면

