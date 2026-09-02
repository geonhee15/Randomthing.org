/* Shared EN / KO switch for the panels.
 *
 * Include on every panel (not the homepage — that has its own switcher and its
 * own copy):
 *   <script defer src="/lang.js"></script>
 *
 * It drops the same pill toggle in the corner, shares the `rt_lang` choice with
 * the homepage, and translates the page from the table below. Panels write a lot
 * of their text from JS at runtime, so instead of rewriting all seventeen games
 * this walks the DOM and swaps any string it recognises, then keeps watching via
 * a MutationObserver so freshly rendered text is translated too. Every node
 * remembers its English original, so switching back is exact. Anything not in
 * the table simply stays in English.
 */
(function () {
  if (window.__rtLang) return;            // never run twice
  window.__rtLang = true;
  if (document.getElementById('lang')) return;   // homepage has its own

  // ---------------------------------------------------------------- dictionary
  var DICT = {
    // -- shared across panels --
    'Back': '뒤로', 'Start': '시작', 'Restart': '다시 시작', 'Reset': '초기화',
    'Pause': '일시정지', 'Save': '저장', 'Load': '불러오기', 'Cancel': '취소',
    'Close': '닫기', 'Score': '점수', 'Best': '최고', 'Level': '레벨', 'Lives': '목숨',
    'Time': '시간', 'Sound': '소리', 'Volume': '음량', 'Toggle sound': '소리 켜기/끄기',
    'Play again': '다시 하기', 'New game': '새 게임', 'Next': '다음',
    'Easy': '쉬움', 'Normal': '보통', 'Hard': '어려움', 'Rounds': '라운드',
    'Draw': '무승부', 'Player 1': '플레이어 1', 'Player 2': '플레이어 2',
    'You': '나', 'Computer': '컴퓨터', '2 Players': '2인용', 'Controls': '조작',

    // -- shared bits injected by other scripts (cookie notice, mini player) --
    'Cookies & local storage': '쿠키 및 로컬 저장소',
    'We keep a few things on your device — like your playlists and best scores — to make these toys work. No tracking, no third parties.':
      '재생목록이나 최고 기록 같은 몇 가지를 기기에 저장해 기능이 동작하게 합니다. 추적도, 제3자 제공도 없습니다.',
    'Decline': '거절', 'Accept': '수락',
    'Now Playing': '재생 중', 'Play or pause': '재생 / 일시정지', 'Stop': '정지',

    // -- Calculator --
    'Calculator': '계산기', 'Construction Kit': '조립 키트',
    'Design your calculator': '나만의 계산기 만들기',
    'Every control is live and always visible. Adjust anything and watch it update instantly.':
      '모든 조절 항목이 항상 보이고 즉시 반영됩니다. 마음껏 바꿔 보세요.',
    'Presets': '프리셋', 'Quick palettes': '빠른 색조합', 'Randomize': '랜덤',
    'Type': '종류', 'Basic': '기본', 'Scientific': '공학용',
    'Layout': '배치', 'Keypad order': '키패드 순서',
    'Calculator — 7 8 9 on top': '계산기식 — 7 8 9 위',
    'Phone — 1 2 3 on top': '전화기식 — 1 2 3 위',
    'Wide zero key': '0 키 넓게', 'Percent key': '% 키', 'Plus / minus key': '± 키',
    'Shape & size': '모양과 크기', 'Calculator width': '계산기 너비',
    'Body radius': '본체 모서리', 'Body padding': '본체 여백', 'Key height': '키 높이',
    'Key gap': '키 간격', 'Key radius': '키 모서리', 'Display radius': '디스플레이 모서리',
    'Height': '높이', 'Depth': '입체감', 'Flat': '평평하게', 'Soft': '부드럽게',
    'Lifted': '떠 보이게', 'Dramatic': '강하게', 'Inset': '눌린 느낌', 'None': '없음',
    'Subtle': '은은하게', '3D lift': '3D 입체', 'Body shadow': '본체 그림자',
    'Button shadow': '버튼 그림자', 'Body border': '본체 테두리', 'Border color': '테두리 색',
    'Colors': '색상', 'Calculator body': '계산기 본체', 'Stage background': '배경',
    'Display': '디스플레이', 'Display text': '디스플레이 글자', 'Number keys': '숫자 키',
    'Number text': '숫자 글자', 'Operators': '연산자', 'Function keys': '기능 키',
    'Equals': '= 키', 'Typography': '글꼴', 'Display font': '디스플레이 글꼴',
    'Button font': '버튼 글꼴', 'Button text': '버튼 글자 크기', 'Button weight': '버튼 굵기',
    'Result size': '결과 크기', 'Expression line': '수식 줄', 'Text alignment': '정렬',
    'Left': '왼쪽', 'Center': '가운데', 'Right': '오른쪽',
    'Regular': '보통', 'Semibold': '약간 굵게', 'Bold': '굵게', 'Extra bold': '매우 굵게',

    // -- Background --
    'Background': '배경화면',
    'Nebula': '성운', 'Liquid': '리퀴드', 'Cubes': '큐브', 'Aurora': '오로라', 'Grid': '그리드',
    'Move to warm the gas · press and hold to ignite it': '움직여서 가스를 데우고 · 길게 누르면 불이 붙습니다',
    'Move to push the blobs around · click for a pulse': '움직여서 방울을 밀어내고 · 클릭하면 파동이 퍼집니다',
    'Move — or drag your finger — to raise the cubes': '마우스를 움직이거나 손가락으로 끌어 큐브를 솟아오르게 하세요',
    'Your browser doesn’t support WebGL, so these wallpapers can’t run.':
      '이 브라우저는 WebGL을 지원하지 않아 배경화면을 실행할 수 없습니다.',

    // -- Brick Break --
    'Brick Break': '벽돌깨기', 'Saves': '저장', 'Save slots': '저장 슬롯',
    'Save here': '여기에 저장', 'Save mid-game, come back later': '게임 도중 저장했다가 나중에 이어서',
    'nothing to save yet': '아직 저장할 내용 없음', 'ready to save': '저장 가능',
    'Extra life': '목숨 추가', 'Multi-ball': '멀티볼', 'Slow ball': '느린 공', 'Wide paddle': '넓은 패들',
    'Move:': '이동:', 'mouse': '마우스', 'drag': '드래그', 'tap': '탭', 'space': '스페이스',
    'Launch:': '발사:', 'Pause:': '일시정지:',

    // -- Clocks --
    'Clocks': '시계', 'Wall Clock': '벽시계', 'Timer': '타이머', 'Hourglass': '모래시계',
    'Science & Maths': '과학과 수학', 'Local time': '현지 시각',

    // -- Color Guesser --
    'Color Guesser': '컬러 맞히기', 'Guess': '맞히기', 'Your guess': '내 답',
    'Actual': '정답', 'Avg': '평균', 'Start guessing': '시작하기', 'Next color →': '다음 색 →',
    'Type the HEX code you think matches the center color': '가운데 색과 같다고 생각하는 HEX 코드를 입력하세요',
    'How does HEX work?': 'HEX 코드란?',
    'Red': '빨강', 'Green': '초록', 'Blue': '파랑',

    // -- Reaction Time --
    'Reaction Time': '반응속도 테스트', 'Click anywhere to start': '아무 곳이나 클릭해서 시작',
    'Last': '최근', 'Avg 5': '최근 5회 평균', 'green': '초록색',
    'Too soon!': '너무 빨라요!', 'Click!': '클릭!', 'Wait for green…': '초록색을 기다리세요…',

    // -- Audio Player --
    'Audio Player': '오디오 플레이어', 'Add audio files': '음악 파일 추가',
    'No tracks yet — add files or record one above.': '아직 트랙이 없습니다 — 파일을 추가하거나 위에서 녹음하세요.',
    'Clear all': '전체 삭제', 'Reset all': '전체 초기화', 'Really reset everything?': '정말 전체를 초기화할까요?',
    'This removes every loaded track from the playlist. It can’t be undone.':
      '재생목록의 모든 트랙이 삭제됩니다. 되돌릴 수 없습니다.',
    'NO MEDIA': '미디어 없음', 'VOL': '음량', 'disc': '디스크', 'red': '빨간',

    // -- Take me to a random… --
    'Take me to a random…': '랜덤한 곳으로…',
    'Pick one and get whisked off to something new in a fresh tab.': '하나를 고르면 새 탭에서 새로운 곳으로 데려다줍니다.',
    'More random jumps coming soon.': '더 많은 랜덤 항목이 곧 추가됩니다.',
    'Random Website': '랜덤 웹사이트', 'Random YouTube Video': '랜덤 유튜브 영상',
    'Random Instagram Account': '랜덤 인스타 계정', 'Random Image': '랜덤 이미지',
    'Random Subreddit': '랜덤 서브레딧', 'Random Wikipedia Article': '랜덤 위키백과 문서',
    'Random Street View': '랜덤 스트리트뷰', 'Random Cat': '랜덤 고양이', 'Random Dog': '랜덤 강아지',
    'open ↗': '열기 ↗',

    // -- Stickman Fight --
    'Stickman Fight': '스틱맨 파이트', 'Online Matchmaking': '온라인 매칭',
    'Fight an AI opponent': 'AI 상대와 대결', 'Play against a real person': '실제 사람과 대결',
    'Same keyboard, two fighters': '한 키보드로 두 명이',
    'Finding an opponent…': '상대를 찾는 중…',
    'Waiting for another player to join the queue.': '다른 플레이어가 들어오기를 기다리는 중입니다.',
    'Matchmaking offline': '매칭 서버 오프라인',
    'Couldn’t reach the server. Try 2 Players or Computer for now.':
      '서버에 연결할 수 없습니다. 지금은 2인용이나 컴퓨터로 즐겨 주세요.',
    'Opponent left': '상대가 나갔습니다', 'They disconnected.': '상대의 연결이 끊겼습니다.',
    'You win!': '승리!', 'Computer wins': '컴퓨터 승리', 'Weapon': '무기', 'Colour': '색상', 'Color': '색상',
    'Axe': '도끼', 'Katana': '카타나', 'Spear': '창', 'Hammer': '해머', 'Shuriken': '표창',
    'Fight!': '시작!', 'Rematch': '다시 대결',

    // -- CPS Test --
    'CPS Test': 'CPS 테스트', 'Clicks': '클릭 수', 'CPS': 'CPS', 'Custom': '직접 입력',
    'Click as fast as you can until time runs out.': '시간이 끝날 때까지 최대한 빠르게 클릭하세요.',
    'Click to try again': '클릭해서 다시 하기', 'Hold on…': '잠시만요…', 'sec': '초',

    // -- Rock Paper Scissors --
    'Rock Paper Scissors': '가위바위보', 'Choose your move!': '낼 것을 고르세요!',
    'Tap a move before the countdown hits zero.': '카운트다운이 끝나기 전에 하나를 고르세요.',
    'Robot wins': '로봇 승리', 'It’s a draw': '무승부', 'It’s a draw.': '무승부입니다.',
    'Reset score': '점수 초기화', 'Rock': '바위', 'Paper': '보', 'Scissors': '가위',

    // -- Stretch! --
    'Insert a photo first — <b>right-click</b> the silhouette': '먼저 사진을 넣으세요 — 실루엣을 <b>우클릭</b>',
    'Press <b>Stretch!</b>, then grab the face and fling it': '<b>Stretch!</b>를 누르고 얼굴을 잡아 당겨 보세요',

    // -- Tic-Tac-Toe / Five in a Row --
    'Tic-Tac-Toe': '틱택토', 'Five in a Row': '오목',
    'Clear record': '전적 초기화', 'Draw — board full.': '무승부 — 판이 가득 찼습니다.',
    'You go first': '내가 선공', 'Computer goes first': '컴퓨터가 선공', 'Random': '랜덤',
    'Wins': '승', 'Draws': '무', 'Losses': '패',

    // -- Sudoku --
    'Sudoku': '스도쿠', 'Erase': '지우기', 'My Stats': '내 기록',
    'Notes: On': '메모: 켬', 'Notes: Off': '메모: 끔',
    'Solved!': '완성!', 'Out of hearts': '하트 소진',
    'Three mistakes — the board resets. Give it another go.': '세 번 틀렸습니다 — 판이 초기화됩니다. 다시 도전해 보세요.',
    'Too small — 4 is the minimum': '너무 작습니다 — 최소 4', 'Keep it 16 or under': '16 이하로 입력하세요',
    'Successes': '성공', 'Fails': '실패', 'Best Time': '최고 기록', 'All Modes': '전체',
    'Easy · 4×4': '쉬움 · 4×4', 'Medium · 6×6': '보통 · 6×6', 'Hard · 9×9': '어려움 · 9×9',
    'size': '크기',

    // -- Speed Math --
    'Speed Math': '스피드 수학', 'Answer': '답', 'Very Hard': '매우 어려움', 'Genius': '천재',
    'Start 10 questions': '10문제 시작', 'Change level': '난이도 바꾸기',
    'Simple addition & subtraction.': '간단한 덧셈과 뺄셈.',
    'Bigger add & subtract, plus simple multiplication.': '조금 큰 덧셈·뺄셈과 간단한 곱셈.',
    'Tough add, subtract, multiply, and simple division.': '복잡한 덧셈·뺄셈·곱셈과 간단한 나눗셈.',
    'Big multiplication & division, and decimal add/subtract.': '큰 곱셈·나눗셈과 소수점 덧셈·뺄셈.',
    'Mixed multi-step expressions with everything at once.': '모든 연산이 섞인 복합 계산식.',
    'First record set!': '첫 기록 달성!',

    // -- Guess Who --
    'Guess Who': '누구게?', 'All 200': '전체 200명', 'Korea': '한국', 'USA': '미국', 'World': '그 외',
    'Start 10 rounds': '10라운드 시작', 'Change region': '지역 바꾸기', 'See results': '결과 보기',
    'Loading…': '불러오는 중…', 'Wrong': '오답', 'Time!': '시간 초과!',
    'Sharp eyes!': '눈썰미가 좋네요!', 'Not bad': '나쁘지 않아요', 'Room to improve': '더 잘할 수 있어요',
    'Could not reach Wikipedia — check your connection.': '위키백과에 연결할 수 없습니다 — 연결을 확인하세요.',
    'No photos available right now.': '지금은 사용할 수 있는 사진이 없습니다.',
    'Mosaic, with one spot always clear.': '모자이크 + 한 곳은 항상 선명합니다.',
    'Mosaic and blur, with one spot a little clearer.': '모자이크 + 블러 + 한 곳만 살짝 선명합니다.',
    'Mosaic and blur — nothing given away.': '모자이크 + 블러 — 힌트가 없습니다.',
    'Photos are loaded live from Wikipedia and remain under their own licences, credited on each answer. People are public figures only.':
      '사진은 위키백과에서 실시간으로 불러오며 각자의 라이선스를 따르고, 정답마다 출처를 표시합니다. 공인만 수록합니다.',

    // ---- gaps found by sweeping each panel ----
    // Speed Math short labels
    'Norm': '보통', 'V.Hard': '매우 어려움', 'No record yet — set one!': '아직 기록이 없습니다 — 도전해 보세요!',
    // Reaction Time (sentence split around the coloured word)
    'When the screen turns': '화면이', ', click as fast as you can.': '으로 바뀌면 최대한 빨리 클릭하세요.',
    // Rock Paper Scissors
    '· Draw': '· 무', '· Robot': '· 로봇', 'Robot': '로봇', 'reset': '초기화', 'Start round': '라운드 시작',
    'Play a robot — lock in your move before the countdown ends.': '로봇과 대결 — 카운트다운이 끝나기 전에 낼 것을 정하세요.',
    // Tic-Tac-Toe / Five in a Row
    'vs Computer': '컴퓨터와 대결', 'Impossible': '불가능', 'You first': '내가 선공',
    'Computer first': '컴퓨터 선공', 'to move': '차례', 'New round': '새 라운드',
    'Reset scores': '점수 초기화', 'Undo': '무르기', 'Black to move': '흑 차례', 'White to move': '백 차례',
    // Brick Break
    'Clear every brick without letting the ball fall. Catch the falling capsules for power-ups.':
      '공을 떨어뜨리지 않고 모든 벽돌을 깨세요. 떨어지는 캡슐을 받으면 강화 효과가 생깁니다.',
    '· Launch:': '· 발사:', '· Pause:': '· 일시정지:',
    // Color Guesser explainer
    'A color in HEX looks like': 'HEX 색상은', '— three pairs for': '— 세 쌍이 각각',
    'and': '그리고', 'Each pair runs from': '각 쌍의 범위는', '(none) to': '(없음) 부터',
    '(full, 255). Mixing the three makes any color.': '(최대, 255) 까지입니다. 셋을 섞으면 모든 색이 나옵니다.',
    'Your job: read the center color and type its HEX. Hints on the sides help on easier modes. Good luck!':
      '가운데 색을 보고 HEX 코드를 맞혀 보세요. 쉬운 난이도에서는 양옆의 힌트가 도움이 됩니다. 행운을 빌어요!',
    // Stickman Fight
    'Ram your spinning axe into your rival to chop off a limb. Whoever is left with only a head loses. Mind the lava pit.':
      '회전하는 도끼로 상대를 들이받아 팔다리를 잘라내세요. 머리만 남은 쪽이 집니다. 용암 구덩이를 조심하세요.',
    'Same keyboard — A/D/Space vs ◄/►/▲': '한 키보드로 — A/D/Space 대 ◄/►/▲',
    'Queue up and fight a real person': '대기열에 들어가 실제 사람과 대결',
    'Set up your fighter': '캐릭터 설정', '— click a key to change it': '— 키를 클릭하면 변경됩니다',
    'Reset keys': '키 초기화', 'Winner': '승자', 'Menu': '메뉴',
    // Clocks — faces
    'Alarm Clock': '알람시계', 'Wrist Watch': '손목시계', 'Digital Clock': '디지털시계',
    'Mathematical Clock': '수학 시계', 'Sundial': '해시계', 'Flip Clock': '플립시계',
    '— drawn with code, showing your local time': '— 코드로 그렸고, 현지 시각을 보여줍니다',
    // Audio Player
    'WAV · MP3 · AIFF · OGG · AAC · or drag & drop': 'WAV · MP3 · AIFF · OGG · AAC · 또는 드래그 앤 드롭',
    'Grab the': '', 'and spin it to scratch & scrub — whip it back for reverse. Press':
      '를 잡고 돌리면 스크래치·탐색이 됩니다. 반대로 튕기면 역재생돼요.',
    'to play backward, or hit the': '버튼으로 역방향 재생,',
    'button to record from your mic.': '버튼으로 마이크 녹음을 할 수 있습니다.',
    // Calculator presets
    'Neo-brutal': '네오 브루탈', 'Terminal': '터미널', 'Pastel': '파스텔', 'Retro LCD': '레트로 LCD',
    // Checklist
    'Checklist': '체크리스트', 'Add': '추가', 'Add an item…': '항목 추가…', 'Add an item': '항목 추가',
    'Nothing here yet — add your first item above.': '아직 아무것도 없습니다 — 위에서 첫 항목을 추가하세요.',
    'Clear done': '완료 항목 지우기', 'Delete': '삭제',

    // Prank Button
    'Prank Button': '장난 버튼', 'Edit': '수정', 'Copy link': '링크 복사',
    'Message': '문구', 'Button 1 (clickable)': '버튼 1 (클릭 가능)', 'Button 2 (runs away)': '버튼 2 (도망감)',
    'Saved on this device. Use Copy link to send the prank with your wording baked in.':
      '이 기기에 저장됩니다. 링크 복사를 누르면 내 문구가 담긴 장난을 그대로 보낼 수 있어요.',
    'That one works. The other one, good luck.': '이건 눌리네요. 다른 하나는… 행운을 빕니다.',
    'Try again': '다시 하기', 'Saved': '저장됨', 'Link copied': '링크가 복사되었습니다',

    // Stretch!
    'Stretch!': '늘리기!',
    'Right-click': '우클릭', 'the silhouette to drop in a photo of someone': '해서 실루엣에 사진을 넣으세요',
    'Insert image': '사진 넣기', 'Insert Image': '사진 넣기', 'Analyzing image…': '이미지 분석 중…',
    // its hints are assembled from fragments around <b> tags
    'Press': '', ', then grab the face and fling it': '를 누르고 얼굴을 잡아 던져 보세요',
    'Insert a photo first —': '먼저 사진을 넣으세요 —', 'right-click': '우클릭', 'the silhouette': '실루엣을',
    'Grab and': '얼굴을', 'pull': '잡아 당기세요', 'the face · press': '·',
    'to pin a spot ·': '를 누르면 못이 박히고 ·', 'a pin to remove it': '하면 못이 빠집니다',
  };

  // Entries that should only apply on one page — the Guess Who roster in
  // particular, since short stage names like "V" or "Rain" would be far too
  // eager to match if they were live site-wide.
  var PAGE_DICT = {
    '/guess-who/': {
      // Korea
      'IU': '아이유', 'Psy': '싸이', 'G-Dragon': '지드래곤', 'Taeyang': '태양', 'RM': 'RM',
      'Jin': '진', 'Suga': '슈가', 'J-Hope': '제이홉', 'Jimin': '지민', 'V': '뷔', 'Jungkook': '정국',
      'Jisoo': '지수', 'Jennie': '제니', 'Rosé': '로제', 'Lisa': '리사', 'Taeyeon': '태연', 'BoA': '보아',
      'Rain': '비', 'Lee Hyori': '이효리', 'Hwasa': '화사', 'Cha Eun-woo': '차은우', 'Jang Won-young': '장원영',
      'Song Joong-ki': '송중기', 'Song Hye-kyo': '송혜교', 'Lee Min-ho': '이민호', 'Park Seo-joon': '박서준',
      'Gong Yoo': '공유', 'Hyun Bin': '현빈', 'Son Ye-jin': '손예진', 'Jun Ji-hyun': '전지현',
      'Bae Suzy': '배수지', 'Kim Soo-hyun': '김수현', 'Lee Byung-hun': '이병헌', 'Song Kang-ho': '송강호',
      'Choi Min-sik': '최민식', 'Ma Dong-seok': '마동석', 'Jung Woo-sung': '정우성', 'Bae Doona': '배두나',
      'Youn Yuh-jung': '윤여정', 'Lee Jung-jae': '이정재', 'Jung Ho-yeon': '정호연', 'Kim Go-eun': '김고은',
      'Bong Joon-ho': '봉준호', 'Park Chan-wook': '박찬욱', 'Hwang Dong-hyuk': '황동혁',
      'Son Heung-min': '손흥민', 'Kim Yuna': '김연아', 'Park Ji-sung': '박지성', 'Ryu Hyun-jin': '류현진',
      'Yoo Jae-suk': '유재석',
      // USA
      'Tom Cruise': '톰 크루즈', 'Brad Pitt': '브래드 피트', 'Leonardo DiCaprio': '리어나도 디캐프리오',
      'Johnny Depp': '조니 뎁', 'Will Smith': '윌 스미스', 'Denzel Washington': '덴젤 워싱턴',
      'Morgan Freeman': '모건 프리먼', 'Tom Hanks': '톰 행크스', 'Robert Downey Jr.': '로버트 다우니 주니어',
      'Scarlett Johansson': '스칼릿 조핸슨', 'Jennifer Lawrence': '제니퍼 로런스', 'Emma Stone': '엠마 스톤',
      'Angelina Jolie': '앤절리나 졸리', 'Meryl Streep': '메릴 스트립', 'Julia Roberts': '줄리아 로버츠',
      'Dwayne Johnson': '드웨인 존슨', 'Zendaya': '젠데이아', 'Samuel L. Jackson': '새뮤얼 L. 잭슨',
      'Steven Spielberg': '스티븐 스필버그', 'Quentin Tarantino': '쿠엔틴 타란티노',
      'Taylor Swift': '테일러 스위프트', 'Beyoncé': '비욘세', 'Ariana Grande': '아리아나 그란데',
      'Billie Eilish': '빌리 아일리시', 'Bruno Mars': '브루노 마스', 'Kanye West': '칸예 웨스트',
      'Eminem': '에미넴', 'Snoop Dogg': '스눕 독', 'Lady Gaga': '레이디 가가', 'Katy Perry': '케이티 페리',
      'Madonna': '마돈나', 'Michael Jackson': '마이클 잭슨', 'Elvis Presley': '엘비스 프레슬리',
      'Bob Dylan': '밥 딜런', 'Selena Gomez': '셀레나 고메즈', 'Kendrick Lamar': '켄드릭 라마',
      'LeBron James': '르브론 제임스', 'Stephen Curry': '스테픈 커리', 'Michael Jordan': '마이클 조던',
      'Kobe Bryant': '코비 브라이언트', 'Serena Williams': '세리나 윌리엄스', 'Tom Brady': '톰 브래디',
      'Muhammad Ali': '무하마드 알리', 'Tiger Woods': '타이거 우즈', 'Elon Musk': '일론 머스크',
      'Bill Gates': '빌 게이츠', 'Mark Zuckerberg': '마크 저커버그', 'Steve Jobs': '스티브 잡스',
      'Oprah Winfrey': '오프라 윈프리', 'Barack Obama': '버락 오바마',
      // World
      'Emma Watson': '엠마 왓슨', 'Daniel Radcliffe': '대니얼 래드클리프', 'Ed Sheeran': '에드 시런',
      'Adele': '아델', 'Harry Styles': '해리 스타일스', 'Benedict Cumberbatch': '베네딕트 컴버배치',
      'Idris Elba': '이드리스 엘바', 'Kate Winslet': '케이트 윈슬럿', 'Tom Holland': '톰 홀랜드',
      'Elton John': '엘튼 존', 'Paul McCartney': '폴 매카트니', 'John Lennon': '존 레넌',
      'Freddie Mercury': '프레디 머큐리', 'David Bowie': '데이비드 보위', 'Rowan Atkinson': '로완 앳킨슨',
      'Daniel Craig': '대니얼 크레이그', 'Elizabeth II': '엘리자베스 2세',
      'Diana, Princess of Wales': '다이애나 왕세자비', 'Winston Churchill': '윈스턴 처칠',
      'Stephen Hawking': '스티븐 호킹', 'Dua Lipa': '두아 리파', 'Lionel Messi': '리오넬 메시',
      'Cristiano Ronaldo': '크리스티아누 호날두', 'Neymar': '네이마르', 'Kylian Mbappé': '킬리안 음바페',
      'Pelé': '펠레', 'Diego Maradona': '디에고 마라도나', 'Zinedine Zidane': '지네딘 지단',
      'Ronaldinho': '호나우지뉴', 'Luka Modrić': '루카 모드리치', 'Erling Haaland': '엘링 홀란',
      'Robert Lewandowski': '로베르트 레반도프스키', 'Mohamed Salah': '모하메드 살라흐',
      'Kevin De Bruyne': '케빈 더 브라위너', 'Andrés Iniesta': '안드레스 이니에스타', 'Ronaldo': '호나우두',
      'Zlatan Ibrahimović': '즐라탄 이브라히모비치', 'David Beckham': '데이비드 베컴',
      'Lewis Hamilton': '루이스 해밀턴', 'Andy Murray': '앤디 머리', 'Harry Kane': '해리 케인',
      'Jude Bellingham': '주드 벨링엄', 'Roger Federer': '로저 페더러', 'Rafael Nadal': '라파엘 나달',
      'Novak Djokovic': '노바크 조코비치', 'Usain Bolt': '우사인 볼트', 'Hayao Miyazaki': '미야자키 하야오',
      'Shohei Ohtani': '오타니 쇼헤이', 'Naomi Osaka': '오사카 나오미', 'Ken Watanabe': '와타나베 켄',
      'Takeshi Kitano': '기타노 다케시', 'Hideo Kojima': '코지마 히데오', 'Ichiro Suzuki': '스즈키 이치로',
      'Haruki Murakami': '무라카미 하루키', 'Shigeru Miyamoto': '미야모토 시게루', 'Jackie Chan': '성룡',
      'Bruce Lee': '이소룡', 'Jet Li': '이연걸', 'Zhang Ziyi': '장쯔이', 'Chow Yun-fat': '주윤발',
      'Andy Lau': '유덕화', 'Jay Chou': '주걸륜', 'Donnie Yen': '견자단', 'Gong Li': '궁리',
      'Shah Rukh Khan': '샤룩 칸', 'Priyanka Chopra': '프리앙카 초프라', 'Deepika Padukone': '디피카 파두콘',
      'Amitabh Bachchan': '아미타브 바찬', 'Aamir Khan': '아미르 칸', 'Virat Kohli': '비라트 콜리',
      'Sachin Tendulkar': '사친 텐둘카르', 'Mahatma Gandhi': '마하트마 간디', 'Justin Bieber': '저스틴 비버',
      'Drake': '드레이크', 'The Weeknd': '위켄드', 'Ryan Gosling': '라이언 고슬링', 'Jim Carrey': '짐 캐리',
      'Keanu Reeves': '키아누 리브스', 'Chris Hemsworth': '크리스 헴스워스', 'Margot Robbie': '마고 로비',
      'Hugh Jackman': '휴 잭맨', 'Nicole Kidman': '니콜 키드먼', 'Cate Blanchett': '케이트 블란쳇',
      'Shakira': '샤키라', 'Bad Bunny': '배드 버니', 'Salma Hayek': '셀마 헤이엑',
      'Sofía Vergara': '소피아 베르가라', 'Karol G': '카롤 지', 'Frida Kahlo': '프리다 칼로',
      'Rihanna': '리한나', 'Nelson Mandela': '넬슨 만델라', 'Albert Einstein': '알베르트 아인슈타인',
      'Marie Curie': '마리 퀴리', 'Audrey Hepburn': '오드리 헵번', 'Charlie Chaplin': '찰리 채플린',
      'Pope Francis': '프란치스코 교황', 'Greta Thunberg': '그레타 툰베리',
      'Vincent van Gogh': '빈센트 반 고흐', 'Leonardo da Vinci': '레오나르도 다 빈치', 'Bob Marley': '밥 말리',
    },
  };
  (function () {
    var pd = PAGE_DICT[location.pathname.toLowerCase()];
    if (pd) Object.keys(pd).forEach(function (k) { DICT[k] = pd[k]; });
  })();

  // city / time-zone names in the Clocks picker (kept with their flag emoji)
  var CITIES = {
    'Local time': '현지 시각', 'UTC': 'UTC', 'New York': '뉴욕', 'Chicago': '시카고', 'Denver': '덴버',
    'Los Angeles': '로스앤젤레스', 'Anchorage': '앵커리지', 'Honolulu': '호놀룰루', 'Toronto': '토론토',
    'Vancouver': '밴쿠버', 'Mexico City': '멕시코시티', 'São Paulo': '상파울루', 'Buenos Aires': '부에노스아이레스',
    'Santiago': '산티아고', 'Bogotá': '보고타', 'Lima': '리마', 'London': '런던', 'Dublin': '더블린',
    'Lisbon': '리스본', 'Madrid': '마드리드', 'Paris': '파리', 'Berlin': '베를린', 'Amsterdam': '암스테르담',
    'Rome': '로마', 'Zurich': '취리히', 'Stockholm': '스톡홀름', 'Warsaw': '바르샤바', 'Athens': '아테네',
    'Kyiv': '키이우', 'Moscow': '모스크바', 'Istanbul': '이스탄불', 'Casablanca': '카사블랑카', 'Lagos': '라고스',
    'Cairo': '카이로', 'Nairobi': '나이로비', 'Johannesburg': '요하네스버그', 'Jerusalem': '예루살렘',
    'Riyadh': '리야드', 'Dubai': '두바이', 'Tehran': '테헤란', 'Karachi': '카라치', 'Delhi': '델리',
    'Dhaka': '다카', 'Bangkok': '방콕', 'Jakarta': '자카르타', 'Singapore': '싱가포르',
    'Kuala Lumpur': '쿠알라룸푸르', 'Manila': '마닐라', 'Hong Kong': '홍콩', 'Shanghai': '상하이',
    'Taipei': '타이베이', 'Seoul': '서울', 'Tokyo': '도쿄', 'Sydney': '시드니', 'Perth': '퍼스',
    'Auckland': '오클랜드', 'Suva': '수바',
  };
  Object.keys(CITIES).forEach(function (c) { DICT[c] = CITIES[c]; });

  // strings that are built at runtime — matched by shape
  var PATTERNS = [
    [/^Round (\d+) \/ (\d+)$/,                 function (m) { return '라운드 ' + m[1] + ' / ' + m[2]; }],
    [/^Best score: (\d+) \/ (\d+)$/,           function (m) { return '최고 점수: ' + m[1] + ' / ' + m[2]; }],
    [/^Best score \((.+?)\): (\d+) \/ (\d+)$/, function (m) { return '최고 점수 (' + tr(m[1]) + '): ' + m[2] + ' / ' + m[3]; }],
    [/^No score yet on (.+?) — set one\.$/,    function (m) { return tr(m[1]) + ' 기록이 아직 없습니다 — 도전해 보세요.'; }],
    [/^No score yet — set one\.$/,             function ()  { return '아직 기록이 없습니다 — 도전해 보세요.'; }],
    [/^First score for (.+?)\.$/,              function (m) { return tr(m[1]) + ' 첫 기록입니다.'; }],
    [/^New best for (.+?) — was (\d+)\.$/,     function (m) { return tr(m[1]) + ' 최고 기록 경신 — 이전 ' + m[2] + '점.'; }],
    [/^Best for (.+?): (\d+)\.$/,              function (m) { return tr(m[1]) + ' 최고 기록: ' + m[2] + '점.'; }],
    [/^Best time: (.+)$/,                      function (m) { return '최고 기록: ' + m[1]; }],
    [/^Best: (.+)$/,                           function (m) { return '최고: ' + m[1]; }],
    [/^(\d+)×(\d+) {2}·  (\d+)×(\d+) boxes$/,  function (m) { return m[1] + '×' + m[2] + '  ·  ' + m[3] + '×' + m[4] + ' 박스'; }],
    [/^(\d+)×(\d+) · (\d+)×(\d+) boxes$/,      function (m) { return m[1] + '×' + m[2] + ' · ' + m[3] + '×' + m[4] + ' 박스'; }],
    [/^Click to start — (\d+) seconds?$/,      function (m) { return '클릭해서 시작 — ' + m[1] + '초'; }],
    [/^(\d+) clicks? in (\d+)s$/,              function (m) { return m[2] + '초 동안 ' + m[1] + '번 클릭'; }],
    [/^(\d+) clicks? in (\d+)s — new best!$/,  function (m) { return m[2] + '초 동안 ' + m[1] + '번 클릭 — 최고 기록!'; }],
    [/^Slot (\d+) — Empty$/,                   function (m) { return '슬롯 ' + m[1] + ' — 비어 있음'; }],
    [/^Slot (\d+) — Level (\d+)$/,             function (m) { return '슬롯 ' + m[1] + ' — 레벨 ' + m[2]; }],
    [/^Locked in (.+)$/,                       function (m) { return tr(m[1]) + ' 선택!'; }],
    [/^Notes: (On|Off)$/,                      function (m) { return '메모: ' + (m[1] === 'On' ? '켬' : '끔'); }],
    [/^(\d+) \/ (\d+)$/,                       function (m) { return m[1] + ' / ' + m[2]; }],
    [/^Enter a size \((.+)\)$/,                function (m) { return '크기를 입력하세요 (' + m[1] + ')'; }],
    [/^(\d+)×(\d+) can't be split into boxes — pick (.+)$/,
      function (m) { return m[1] + '×' + m[2] + '은 박스로 나눌 수 없습니다 — ' + m[3] + ' 중에서 고르세요'; }],
    [/^You solved the (\d+)×(\d+) grid in (.+?) with no mistakes\.$/,
      function (m) { return m[1] + '×' + m[2] + ' 판을 ' + m[3] + ' 만에 실수 없이 풀었습니다.'; }],
    [/^You solved the (\d+)×(\d+) grid in (.+?) with (\d+) mistakes?\.$/,
      function (m) { return m[1] + '×' + m[2] + ' 판을 ' + m[3] + ' 만에 ' + m[4] + '번 틀리고 풀었습니다.'; }],
    [/^(.+) — done!$/,                         function (m) { return tr(m[1]) + ' 완료!'; }],
    [/^New best! \(was (.+)\)$/,               function (m) { return '최고 기록 경신! (이전 ' + m[1] + ')'; }],
    [/^A mosaicked face sharpens fast — name it before it resolves, and the rougher it still is, the more points you get\. (.+?) (\d+) faces in this set\.$/,
      function (m) { return '모자이크 얼굴이 빠르게 선명해집니다 — 다 드러나기 전에 맞히세요. 거칠수록 점수가 높아요. ' + tr(m[1]) + ' 이 세트에는 ' + m[2] + '명이 있습니다.'; }],
    [/^A blurred face sharpens second by second\..*?(\d+) faces in this set\.$/,
      function (m) { return '흐릿한 얼굴이 초마다 선명해집니다. 이 세트에는 ' + m[1] + '명이 있습니다.'; }],
    [/^(\d+) of (\d+) done$/,                  function (m) { return m[2] + '개 중 ' + m[1] + '개 완료'; }],
    [/^Dodged (\d+) times?$/,                  function (m) { return m[1] + '번 도망갔습니다'; }],
    [/^(.+) — Randomthing\.org$/,              function (m) { return tr(m[1]) + ' — Randomthing.org'; }],
    // Wikipedia one-liners under a Guess Who answer, e.g. "South Korean singer (born 1993)"
    [/^([A-Z][A-Za-z ]+?) ([a-z][a-z\- ]+?) \(born (\d{4})\)$/,
      function (m) { return natRole(m[1], m[2]) + ' (' + m[3] + '년생)'; }],
    [/^([A-Z][A-Za-z ]+?) ([a-z][a-z\- ]+?) \((\d{4})[–-](\d{4})\)$/,
      function (m) { return natRole(m[1], m[2]) + ' (' + m[3] + '–' + m[4] + ')'; }],
    // flag/pin prefixed entries in the Clocks time-zone picker: keep the emoji, translate the name
    [/^([\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️‍]+\s*)(.{2,40})$/u,
      function (m) { return m[1] + tr(m[2]); }],
  ];

  // nationality + occupation used by the Wikipedia one-liner patterns above.
  // Anything not listed keeps its English word, so the line still reads.
  var NAT = {
    'South Korean': '대한민국', 'North Korean': '북한', 'American': '미국', 'British': '영국',
    'English': '영국', 'Scottish': '스코틀랜드', 'Irish': '아일랜드', 'Welsh': '웨일스',
    'Japanese': '일본', 'Chinese': '중국', 'Hong Kong': '홍콩', 'Taiwanese': '대만',
    'Indian': '인도', 'Canadian': '캐나다', 'Australian': '호주', 'New Zealand': '뉴질랜드',
    'French': '프랑스', 'German': '독일', 'Italian': '이탈리아', 'Spanish': '스페인',
    'Portuguese': '포르투갈', 'Dutch': '네덜란드', 'Belgian': '벨기에', 'Swiss': '스위스',
    'Swedish': '스웨덴', 'Norwegian': '노르웨이', 'Danish': '덴마크', 'Polish': '폴란드',
    'Croatian': '크로아티아', 'Serbian': '세르비아', 'Greek': '그리스', 'Russian': '러시아',
    'Ukrainian': '우크라이나', 'Turkish': '튀르키예', 'Argentine': '아르헨티나', 'Brazilian': '브라질',
    'Mexican': '멕시코', 'Colombian': '콜롬비아', 'Chilean': '칠레', 'Jamaican': '자메이카',
    'Barbadian': '바베이도스', 'Puerto Rican': '푸에르토리코', 'Egyptian': '이집트', 'Kenyan': '케냐',
    'Nigerian': '나이지리아', 'South African': '남아프리카공화국', 'Israeli': '이스라엘', 'Iranian': '이란',
    'Pakistani': '파키스탄', 'Bangladeshi': '방글라데시', 'Thai': '태국', 'Indonesian': '인도네시아',
    'Filipino': '필리핀', 'Singaporean': '싱가포르', 'Malaysian': '말레이시아', 'Austrian': '오스트리아',
    'Norwegian-born': '노르웨이',
  };
  var ROLE = {
    'singer': '가수', 'singer and actress': '가수 겸 배우', 'singer and actor': '가수 겸 배우',
    'singer-songwriter': '싱어송라이터', 'rapper': '래퍼', 'rapper and singer': '래퍼 겸 가수',
    'actress': '배우', 'actor': '배우', 'actor and singer': '배우 겸 가수',
    'footballer': '축구 선수', 'football manager': '축구 감독', 'basketball player': '농구 선수',
    'baseball player': '야구 선수', 'tennis player': '테니스 선수', 'sprinter': '단거리 육상 선수',
    'cricketer': '크리켓 선수', 'boxer': '복싱 선수', 'golfer': '골프 선수', 'swimmer': '수영 선수',
    'gymnast': '체조 선수', 'figure skater': '피겨 스케이팅 선수', 'racing driver': '카레이서',
    'film director': '영화감독', 'director': '감독', 'filmmaker': '영화 제작자',
    'businessman': '기업인', 'entrepreneur': '기업가', 'business magnate': '기업인',
    'politician': '정치인', 'painter': '화가', 'artist': '예술가', 'writer': '작가',
    'novelist': '소설가', 'physicist': '물리학자', 'scientist': '과학자', 'chemist': '화학자',
    'mathematician': '수학자', 'comedian': '코미디언', 'television presenter': '방송인',
    'media personality': '방송인', 'model': '모델', 'animator': '애니메이터',
    'video game designer': '게임 디자이너', 'musician': '뮤지션', 'entertainer': '방송인',
    'activist': '활동가', 'engineer': '엔지니어', 'philanthropist': '자선가',
    'songwriter': '작곡가', 'producer': '프로듀서', 'record producer': '음반 프로듀서',
    'dancer': '댄서', 'author': '작가', 'screenwriter': '각본가', 'investor': '투자자',
    'television host': '방송 진행자', 'presenter': '진행자', 'inventor': '발명가',
    'composer': '작곡가', 'DJ': 'DJ', 'martial artist': '무술가', 'wrestler': '레슬링 선수',
  };
  function natRole(nat, role) {
    var n = NAT[nat] !== undefined ? NAT[nat] : nat;
    var r = ROLE[role];
    if (r === undefined) {
      // Wikipedia loves compound roles ("rapper and songwriter", "actor, producer
      // and director") — translate each part it knows and join them Korean-style.
      var parts = role.split(/,\s*|\s+and\s+/).filter(Boolean);
      if (parts.length > 1 && parts.every(function (p) { return ROLE[p] !== undefined; }))
        r = parts.map(function (p) { return ROLE[p]; }).join(' 겸 ');
      else r = role;
    }
    return n + ' ' + r;
  }

  function tr(s) {
    if (DICT[s] !== undefined) return DICT[s];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = s.match(PATTERNS[i][0]);
      if (m) return PATTERNS[i][1](m);
    }
    return s;                                  // unknown -> leave alone
  }
  function known(s) {
    if (DICT[s] !== undefined) return true;
    for (var i = 0; i < PATTERNS.length; i++) if (PATTERNS[i][0].test(s)) return true;
    return false;
  }

  // ------------------------------------------------------------------- engine
  var LANG = 'en', busy = false;
  var ATTRS = ['placeholder', 'title', 'aria-label'];

  function swapText(node) {
    var orig = ('__rtEn' in node) ? node.__rtEn : node.nodeValue;
    var key = (orig || '').trim();
    if (!key || key.length > 400) return;
    if (!('__rtEn' in node)) {
      if (!known(key)) return;                 // nothing to do, don't tag it
      node.__rtEn = node.nodeValue;
    }
    var want = (LANG === 'ko') ? orig.replace(key, tr(key)) : orig;
    if (node.nodeValue !== want) node.nodeValue = want;
  }

  function swapAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], cur = el.getAttribute(a);
      if (cur === null) continue;
      var slot = '__rtEn_' + a;
      var orig = (slot in el) ? el[slot] : cur;
      var key = orig.trim();
      if (!key) continue;
      if (!(slot in el)) { if (!known(key)) continue; el[slot] = cur; }
      var want = (LANG === 'ko') ? tr(key) : el[slot];
      if (el.getAttribute(a) !== want) el.setAttribute(a, want);
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { swapText(root); return; }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest('#lang')) return;         // never touch our own toggle
    var tag = root.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CANVAS') return;
    swapAttrs(root);
    for (var n = root.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) swapText(n);
      else walk(n);
    }
  }

  function applyAll() {
    busy = true;
    try {
      walk(document.body);
      if (document.title) {
        if (!('__rtEnTitle' in document)) {
          if (known(document.title.trim())) document.__rtEnTitle = document.title;
        }
        if ('__rtEnTitle' in document)
          document.title = (LANG === 'ko') ? tr(document.__rtEnTitle.trim()) : document.__rtEnTitle;
      }
      document.documentElement.lang = (LANG === 'ko') ? 'ko' : 'en';
    } finally { busy = false; }
  }

  // ------------------------------------------------------------------- toggle
  var css = ''
    + '.rt-lang{position:fixed;z-index:2147482000;display:flex;gap:2px;padding:3px;border-radius:999px;'
    + 'background:rgba(128,128,144,.20);border:1px solid rgba(128,128,144,.22);'
    + '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);'
    + 'top:max(10px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));'
    + 'font-family:"Inter",system-ui,-apple-system,sans-serif;-webkit-user-select:none;user-select:none;}'
    + '.rt-lang button{border:none;background:transparent;cursor:pointer;color:#9a9aa6;font-weight:700;'
    + 'font-size:11.5px;padding:5px 10px;border-radius:999px;line-height:1.2;white-space:nowrap;flex:0 0 auto;'
    + 'width:auto;min-width:0;height:auto;transition:color .14s,background .14s;}'
    + '.rt-lang button:hover{color:#fff;}'
    + '.rt-lang button.on{background:#fff;color:#1d1d1f;box-shadow:0 1px 3px rgba(0,0,0,.2);}'
    + '@media (max-width:380px){.rt-lang button{padding:4px 8px;font-size:11px;}}';

  // panels that already own the top-right corner get the pill nudged out of the way
  var OFFSET = {
    '/brick-break/':        { top: '58px' },
    '/rock-paper-scissor/': { top: '58px' },
    '/stickman-fight/':     { top: '', bottom: '12px' },
    '/calculator/':         { top: '58px' },
    '/audio-player/':       { top: '58px' },
    '/clocks/':             { top: '', bottom: '12px' },
    '/background/':         { top: '', bottom: '64px' },
  };

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div'); box.className = 'rt-lang'; box.id = 'rtLang';
    box.innerHTML = '<button type="button" data-l="en">EN</button><button type="button" data-l="ko">한국어</button>';
    var o = OFFSET[location.pathname.toLowerCase()];
    if (o) {
      // pinning to the bottom means the stylesheet's `top` has to be released,
      // otherwise the pill is stretched between the two edges
      if (o.bottom !== undefined) { box.style.top = 'auto'; box.style.bottom = o.bottom; }
      else if (o.top !== undefined) box.style.top = o.top;
    }
    (document.body || document.documentElement).appendChild(box);
    box.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { set(b.dataset.l); });
    });
    return box;
  }

  function set(l) {
    LANG = (l === 'ko') ? 'ko' : 'en';
    window.RT_LANG = LANG;                    // panels can read this if they need to
    try { localStorage.setItem('rt_lang', LANG); } catch (e) {}
    var box = document.getElementById('rtLang');
    if (box) box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === LANG); });
    applyAll();
    window.dispatchEvent(new CustomEvent('rt-lang', { detail: LANG }));
  }

  function boot() {
    build();
    var saved = null;
    try { saved = localStorage.getItem('rt_lang'); } catch (e) {}
    if (!saved) saved = (navigator.language || '').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'en';
    set(saved === 'ko' ? 'ko' : 'en');

    // keep translating text the games render later
    try {
      new MutationObserver(function (muts) {
        if (busy || LANG !== 'ko') return;
        busy = true;
        try {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'characterData') swapText(m.target);
            else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
          }
        } finally { busy = false; }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
