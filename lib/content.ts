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
    details: {
      label: string;
      code: string;
      title: string;
      text: string;
    }[];
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
    title: "우리는 매일\n다시 고른 변수였어.",
    subtitle:
      "딱 한 번만 실행되는 스크립트야. 소리를 켜고, 아래 한 줄을 눌러 줘.",
    runLabel: "node proposal.js",
  },
  scenes: [
    {
      id: "scene-declare",
      photoUrl: null,
      code: "let us = {};",
      title: "빈 채로 시작했어",
      text: "그날 우리는 let이었어. 아무것도 담기지 않아서, 무엇이든 될 수 있었지.",
    },
    {
      id: "scene-memory-1",
      photoUrl: null,
      code: "us.memories.push('처음');",
      title: "처음이라는 장면",
      text: "언제, 어떻게였는지는 우리만 알아. 그 하나가 배열의 첫 칸이 됐어.",
    },
    {
      id: "scene-memory-2",
      photoUrl: null,
      code: "us.memories.push('평범한 하루');",
      title: "평범해서 남은 날",
      text: "특별한 것도, 계획도 없던 날이 이상하게 더 오래 남아. 배열은 계속 길어졌고, 나는 그게 좋았어.",
    },
    {
      id: "scene-memory-3",
      photoUrl: null,
      code: "us = us; // 매일 다시",
      title: "매일 다시 골랐어",
      text: "let은 언제든 다른 값을 담을 수 있어. 그런데도 매일 다시 고르면, 결국 같은 우리였어.",
    },
  ],
  freeze: {
    code: "Object.freeze(us);",
    title: "시간을 멈추려는 게 아니야.\n약속을 안 바꾸려는 거야.",
    text: "우리는 앞으로도 웃고, 다투고, 변할 거야. 그 모든 변화 속에서도 서로를 사랑하겠다는 이 한 줄만은, 오늘 그대로 두고 싶어.",
    details: [
      {
        label: "01 / 불변성",
        code: "Object.freeze(us)",
        title: "변하지 말자는 게\n아니야.",
        text: "사람은 변하고 관계도 자라. 좋아하는 것도, 사는 곳도 달라지겠지. 불변성은 그 변화를 막는 게 아니라, 변해도 서로를 대하는 마음만은 안 바꾸겠다는 뜻이야.",
      },
      {
        label: "02 / delete",
        code: "delete us.memories // 안 됨",
        title: "지나온 건\n안 지울게.",
        text: "얼린 상자에선 담긴 걸 함부로 못 지워. 좋았던 날만 골라 사랑하지 않고, 서툴렀던 순간도 우리 일부로 안고 갈게.",
      },
      {
        label: "03 / push",
        code: "us.memories.push('내일') // 가능",
        title: "약속은 그대로,\n우리는 계속 자라게.",
        text: "freeze는 상자의 바깥만 지키는 얕은 동결이야. 안쪽은 안 얼어. 그래서 매일 새 기억을 담고, 매일 다시 너를 고를 수 있어.",
      },
    ],
  },
  finale: {
    question: "Shall we?",
    subtext: "마지막 한 줄이 남았어. 같이 실행해 줄래?",
    yesLabel: "yes",
    noLabel: "no",
    photoUrl: null,
    afterCode: "Object.isFrozen(us) // true",
    afterTitle: "이제 우리는 상수야.",
    afterText: "같이 실행해 줘서 고마워. 사랑해.",
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
