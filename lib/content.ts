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
    title: "우리의 시간을 멈추려는 게 아니라,\n우리라는 약속을 지키려는 것.",
    text: "개발을 몰라도 괜찮아. Object.freeze()라는 이름은 무언가를 차갑게 얼려 멈추는 것처럼 보이지만, 내가 담고 싶은 뜻은 조금 달라. 앞으로 우리는 계속 웃고, 다투고, 배우고, 변할 거야. 그 모든 변화 속에서도 서로를 사랑하고 존중하겠다는 가장 바깥의 약속만은 함부로 바꾸지 않겠다는 뜻이야.",
    details: [
      {
        label: "01 / 먼저, 객체라는 말",
        code: "const us = { you, me, memories, promise }",
        title: "객체는 어려운 말이 아니라,\n우리의 이야기를 담은 상자야.",
        text: "개발에서는 서로 관련된 것들을 한곳에 모아 둔 묶음을 객체라고 불러. 너와 나, 함께 보낸 시간, 서로에게 한 약속을 하나의 상자에 차곡차곡 담고 그 상자의 이름을 ‘우리’라고 붙였다고 생각하면 돼.",
      },
      {
        label: "02 / 불변성이라는 말",
        code: "Object.freeze(us)",
        title: "불변성은 아무것도\n변하지 않는다는 뜻이 아니야.",
        text: "사람은 변하고 관계도 자라. 좋아하는 음식도, 사는 곳도, 꿈의 모양도 달라질 수 있어. 여기서 불변성이란 그 변화를 막겠다는 뜻이 아니라, 변화가 찾아와도 서로를 대하는 마음의 기준을 잃지 않겠다는 뜻이야.",
      },
      {
        label: "03 / 바꾸지 않겠다는 것",
        code: "us.promise = '다른 마음' // 바뀌지 않음",
        title: "오늘 건넨 약속을\n내일 다른 뜻으로 바꾸지 않기.",
        text: "동결된 객체의 값은 마음대로 고쳐 쓸 수 없어. 나도 오늘 한 말을 편한 순간에만 지키거나, 시간이 흘렀다는 이유로 다른 의미였다고 말하지 않을게. 말보다 행동으로 같은 뜻을 오래 증명할게.",
      },
      {
        label: "04 / 지우지 않겠다는 것",
        code: "delete us.memories // 지울 수 없음",
        title: "지나온 시간을\n없었던 일로 만들지 않기.",
        text: "동결된 객체에서는 이미 담긴 것을 함부로 지울 수도 없어. 행복했던 날만 골라 사랑하지 않고, 서툴렀던 순간과 미안했던 기억도 우리의 일부로 받아들일게. 잘못은 외면하지 않고, 함께 고쳐 가는 사람이 될게.",
      },
      {
        label: "05 / 그래도 계속 자라는 것",
        code: "us.memories.push('내일의 우리') // 가능",
        title: "약속은 지키면서도,\n우리의 안쪽은 계속 자라게.",
        text: "Object.freeze()는 상자의 가장 바깥을 지키는 ‘얕은 동결’이야. 상자 안에 담긴 기억까지 얼려 버리지는 않아. 그래서 우리는 새로운 여행을 담고, 새로운 꿈을 만들고, 어제보다 더 나은 사람이 되어 갈 수 있어.",
      },
      {
        label: "06 / 내가 말하고 싶은 불변성",
        code: "Object.isFrozen(us) // true",
        title: "같은 모습으로 머무는 것이 아니라,\n계속 같은 편이 되어 주는 것.",
        text: "불변성은 한 번 약속했으니 아무 노력도 하지 않아도 된다는 말이 아니야. 오히려 매일 달라지는 삶 속에서 매일 다시 너를 선택하는 일이야. 기쁜 날에는 가장 먼저 나누고, 힘든 날에는 가장 오래 곁에 남는 사람. 내가 지키고 싶은 불변성은 바로 그런 모습이야.",
      },
    ],
  },
  finale: {
    question: "Shall we?",
    subtext: "이 스크립트의 마지막 줄을 함께 실행해 줄래?",
    yesLabel: "yes",
    noLabel: "no",
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
