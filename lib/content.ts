export type Scene = {
  id: string;
  photoUrl: string | null;
  code: string;
  title: string;
  text: string;
};

export type Content = {
  hero: {
    filename: string;
    title: string;
    subtitle: string;
    runLabel: string;
  };
  scenes: Scene[];
  freeze: {
    code: string;
    title: string;
    text: string;
  };
  finale: {
    question: string;
    subtext: string;
    yesLabel: string;
    noLabel: string;
    photoUrl: string | null;
    afterCode: string;
    afterTitle: string;
    afterText: string;
  };
  song: {
    title: string;
    artist: string;
  };
  bgmUrl: string | null;
  lyrics: string;
};

export const defaultContent: Content = {
  hero: {
    filename: "proposal.js",
    title: "우리는 변하는\n선언문이지, 끝이 아니야.",
    subtitle:
      "이 스크립트는 단 한 번만 실행됩니다. 소리를 켜고, 아래 명령어를 실행해 주세요.",
    runLabel: "node proposal.js",
  },
  scenes: [
    {
      id: "scene-declare",
      photoUrl: null,
      code: "let us = { since: '20XX.XX.XX', memories: [] };",
      title: "let으로 시작한 우리",
      text: "그날, 우리는 let으로 선언됐어. 아직 아무것도 담기지 않았고, 그래서 무엇이든 될 수 있는 변수였지.",
    },
    {
      id: "scene-memory-1",
      photoUrl: null,
      code: "us.memories.push('처음, 우리');",
      title: "처음이라는 장면",
      text: "관리자 페이지에서 이 컷의 사진과 문장을 바꿔 주세요. 우리만 아는 첫 기억을 여기에 담아 주세요.",
    },
    {
      id: "scene-memory-2",
      photoUrl: null,
      code: "us.memories.push('사소해서 소중한 날들');",
      title: "평범해서 기억나는 날",
      text: "특별한 이벤트도, 아무 계획도 없던 날이 더 오래 남아. 배열은 계속 길어졌고, 나는 그게 좋았어.",
    },
    {
      id: "scene-memory-3",
      photoUrl: null,
      code: "us = us; // 매일 다시 고르는 일",
      title: "사랑은 상수가 아니었어",
      text: "let은 언제든 다른 값을 담을 수 있어. 그런데도 나는 매일 다시 고르면 결국 같은 우리였어.",
    },
  ],
  freeze: {
    code: "Object.freeze(us);",
    title: "이제 우리를 다시 쓸 수 없게.",
    text: "변하지 않겠다는 말보다, 어떤 변화 안에서도 우리라는 참조를 지키겠다는 약속. 자바스크립트에서 얼어붙은 객체는 다시 바뀌지 않아. 나는 우리의 이름을 그렇게 오래 지키고 싶어.",
  },
  finale: {
    question: "Shall we?",
    subtext: "이 스크립트의 마지막 줄을 함께 실행해 줄래?",
    yesLabel: "응, 영원히",
    noLabel: "조금만 더 생각해볼게",
    photoUrl: null,
    afterCode: "Object.isFrozen(us) // true",
    afterTitle: "이제 우리는 상수예요",
    afterText: "함께 실행해줘서 고마워요. 그리고 사랑해요.",
  },
  song: {
    title: "숙명",
    artist: "Official髭男dism",
  },
  bgmUrl: null,
  lyrics: "",
};

export type AnswerRecord = {
  answer: string;
  answeredAt: string;
};

export type LyricLine = { time: number; text: string };

const TIME_TAG = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const text = raw.replace(TIME_TAG, "").trim();
    if (!text) continue;
    TIME_TAG.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TIME_TAG.exec(raw)) !== null) {
      const minutes = Number.parseInt(match[1], 10);
      const seconds = Number.parseInt(match[2], 10);
      const fraction = match[3]
        ? Number.parseInt(match[3].padEnd(3, "0"), 10) / 1000
        : 0;
      lines.push({ time: minutes * 60 + seconds + fraction, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}
