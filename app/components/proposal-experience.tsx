"use client";

/* eslint-disable @next/next/no-img-element -- 관리자 지정 Blob URL은 호스트가 런타임에 결정됩니다. */

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, Check, MusicNotes, Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { type Content, parseLrc } from "@/lib/content";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, spring);
  const smoothY = useSpring(y, spring);
  const moveX = useTransform(smoothX, (value) => value * 0.18);
  const moveY = useTransform(smoothY, (value) => value * 0.18);

  return (
    <motion.button
      type="button"
      className={className}
      style={{ x: moveX, y: moveY }}
      whileTap={{ scale: 0.98, y: 1 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

const Snow = memo(function Snow() {
  const flakes = useMemo(() => Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: (index * 37 + 11) % 100,
    size: 2 + (index % 4),
    duration: 10 + (index % 7) * 1.7,
    delay: -(index % 9) * 1.4,
    opacity: 0.24 + (index % 5) * 0.09,
  })), []);
  return <div className="snow" aria-hidden="true">{flakes.map((flake) => <i key={flake.id} style={{ left: `${flake.left}%`, width: flake.size, height: flake.size, animationDuration: `${flake.duration}s`, animationDelay: `${flake.delay}s`, opacity: flake.opacity }} />)}</div>;
});

function MediaFrame({ src, index, alt }: { src: string | null; index: number; alt: string }) {
  return (
    <div className={`photo-frame ${index % 2 ? "photo-frame-tall" : "photo-frame-wide"}`}>
      {src ? <img src={src} alt={alt} /> : <div className="photo-empty"><span>PHOTO_{String(index + 1).padStart(2, "0")}</span><small>/admin에서 사진을 추가하세요</small></div>}
      <span className="photo-index">0{index + 1}</span>
    </div>
  );
}

export function ProposalExperience({ content: initialContent }: { content: Content }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [content, setContent] = useState(initialContent);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState("");
  const [sending, setSending] = useState(false);
  const lyrics = useMemo(() => parseLrc(content.lyrics), [content.lyrics]);
  const lyricIndex = lyrics.findLastIndex((line) => line.time <= time);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") return;
    const controller = new AbortController();
    fetch("/api/content", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.content) setContent(data.content); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setTime(audio.currentTime);
    const ended = () => setPlaying(false);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", ended);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", ended);
    };
  }, []);

  async function start() {
    setStarted(true);
    if (content.bgmUrl && audioRef.current) {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
    window.setTimeout(() => document.querySelector("#story")?.scrollIntoView({ behavior: "smooth" }), 380);
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !content.bgmUrl) return;
    if (audio.paused) { await audio.play(); setPlaying(true); } else { audio.pause(); setPlaying(false); }
  }

  async function submitAnswer(value: string) {
    if (sending || answer) return;
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") {
      setAnswer(value);
      return;
    }
    setSending(true);
    setAnswerError("");
    try {
      const response = await fetch("/api/answer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answer: value }) });
      if (!response.ok) throw new Error();
      setAnswer(value);
    } catch {
      setAnswerError("응답을 기록하지 못했어요. 잠시 후 다시 눌러 주세요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="proposal-shell">
      <audio ref={audioRef} src={content.bgmUrl ?? undefined} preload="metadata" muted={muted} />
      <Snow />
      <AnimatePresence>{started && <motion.aside className="music-dock" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
        <button type="button" onClick={togglePlay} aria-label={playing ? "음악 일시정지" : "음악 재생"} disabled={!content.bgmUrl}>{playing ? <Pause size={17} weight="fill" /> : <Play size={17} weight="fill" />}</button>
        <div><strong>{content.song.title}</strong><span>{content.song.artist}</span></div>
        <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "음소거 해제" : "음소거"} disabled={!content.bgmUrl}>{muted ? <SpeakerSlash size={17} /> : <SpeakerHigh size={17} />}</button>
      </motion.aside>}</AnimatePresence>

      <section className="hero">
        <div className="hero-rail"><span>01</span><i /><span>RUN</span></div>
        <div className="terminal">
          <div className="terminal-bar"><span>{content.hero.filename}</span><span>UTF-8</span></div>
          <div className="terminal-body">
            <p className="eyebrow">A PRIVATE REPOSITORY / 2026</p>
            <h1>{content.hero.title}</h1>
            <p className="hero-copy">{content.hero.subtitle}</p>
            <MagneticButton className="run-button" onClick={start}><Play size={18} weight="fill" /><span>{started ? "script is running" : content.hero.runLabel}</span></MagneticButton>
          </div>
        </div>
        <a className="scroll-cue" href="#story"><ArrowDown size={17} /><span>SCROLL TO READ</span></a>
      </section>

      <section id="story" className="story">
        <header className="section-heading"><span>02 / MUTABLE</span><h2>변할 수 있어서<br />더 오래 사랑한 기록.</h2></header>
        {content.scenes.length ? content.scenes.map((scene, index) => (
          <motion.article className={`scene ${index % 2 ? "scene-reverse" : ""}`} key={scene.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ ...spring, delay: 0.05 }}>
            <MediaFrame src={scene.photoUrl} index={index} alt={scene.title} />
            <div className="scene-copy"><code>{scene.code}</code><h3>{scene.title}</h3><p>{scene.text}</p></div>
          </motion.article>
        )) : <div className="story-empty">아직 저장된 장면이 없습니다.<br /><small>/admin에서 첫 장면을 추가해 주세요.</small></div>}
      </section>

      <section className="freeze-section">
        <div className="freeze-rule"><span>03</span><i /><span>IMMUTABLE</span></div>
        <motion.div className="freeze-code" initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.7 }} transition={spring}><span>const promise =</span><strong>{content.freeze.code}</strong><i className="freeze-pulse" /></motion.div>
        <div className="freeze-copy"><h2>{content.freeze.title}</h2><p>{content.freeze.text}</p></div>
      </section>

      <section className="freeze-details" aria-label="Object.freeze 상세 설명">
        {content.freeze.details.map((detail, index) => (
          <motion.article
            className="freeze-detail"
            key={`${detail.label}-${index}`}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={spring}
          >
            <div className="freeze-detail-meta"><span>{detail.label}</span><code>{detail.code}</code></div>
            <div className="freeze-detail-copy"><h3>{detail.title}</h3><p>{detail.text}</p></div>
          </motion.article>
        ))}
      </section>

      <section className="lyrics-section">
        <div className="song-meta"><MusicNotes size={20} /><span>NOW PLAYING</span><strong>{content.song.title}</strong><small>{content.song.artist}</small></div>
        <div className="lyric-window" aria-live="polite">
          {lyrics.length ? lyrics.map((line, index) => <p key={`${line.time}-${index}`} className={index === lyricIndex ? "active" : index < lyricIndex ? "past" : ""}>{line.text}</p>) : <p className="lyric-empty">번역 가사는 관리자 페이지에서<br />LRC 형식으로 등록해 주세요.</p>}
        </div>
      </section>

      <section className="finale">
        <div className="finale-photo">{content.finale.photoUrl ? <img src={content.finale.photoUrl} alt="우리의 마지막 장면" /> : <div className="photo-empty"><span>FINAL_FRAME</span><small>/admin에서 마지막 사진을 추가하세요</small></div>}</div>
        <div className="finale-copy">
          <span className="eyebrow">04 / THE LAST LINE</span>
          <AnimatePresence mode="wait">{answer ? <motion.div key="answered" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="answer-result"><Check size={30} weight="bold" /><code>{content.finale.afterCode}</code><h2>{content.finale.afterTitle}</h2><p>{content.finale.afterText}</p></motion.div> : <motion.div key="question" exit={{ opacity: 0, y: -20 }}><h2>{content.finale.question}</h2><p>{content.finale.subtext}</p><div className="answer-actions"><MagneticButton className="yes-button" onClick={() => submitAnswer(content.finale.yesLabel)}>{sending ? "기록하는 중" : content.finale.yesLabel}</MagneticButton><button type="button" className="no-button" onClick={() => submitAnswer(content.finale.noLabel)} disabled={sending}>{content.finale.noLabel}</button></div>{answerError && <p className="answer-error" role="alert">{answerError}</p>}</motion.div>}</AnimatePresence>
        </div>
      </section>
      <footer><span>proposal.js</span><span>Object.freeze(us)</span></footer>
    </main>
  );
}
