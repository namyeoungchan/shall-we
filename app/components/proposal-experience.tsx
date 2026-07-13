"use client";

/* eslint-disable @next/next/no-img-element -- 관리자 지정 Blob URL은 호스트가 런타임에 결정됩니다. */

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowDown, MusicNotes, Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { type Content, parseLrc } from "@/lib/content";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const LOCK_KEY = "shall-we:final-answer:v1";

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

const LockedFinale = memo(function LockedFinale({ content, answer }: { content: Content; answer: string }) {
  const reduceMotion = useReducedMotion();
  const photo = content.finale.photoUrl ?? [...content.scenes].reverse().find((scene) => scene.photoUrl)?.photoUrl ?? null;
  const particles = useMemo(() => Array.from({ length: 46 }, (_, index) => ({
    id: index,
    x: ((index * 43) % 120) - 10,
    y: ((index * 67) % 120) - 10,
    delay: (index % 12) * 0.075,
    duration: 2.6 + (index % 7) * 0.26,
    size: 2 + (index % 5),
    drift: ((index * 29) % 80) - 40,
  })), []);

  return (
    <motion.main className="locked-finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      <div className="locked-photo" role="img" aria-label="우리의 마지막 사진">
        {photo ? (
          <motion.img
            src={photo}
            alt="우리의 마지막 사진"
            initial={reduceMotion ? false : { scale: 1.2, filter: "grayscale(1) blur(14px) brightness(.45)" }}
            animate={{ scale: 1, filter: "grayscale(0) blur(0px) brightness(.82)" }}
            transition={{ duration: reduceMotion ? 0 : 3.2, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.45 }}
          />
        ) : (
          <div className="locked-photo-empty"><span>OUR FINAL FRAME</span><small>마지막 사진을 연결하면 이 장면을 가득 채웁니다.</small></div>
        )}
      </div>

      <div className="final-particles" aria-hidden="true">
        {particles.map((particle) => (
          <i
            key={particle.id}
            style={{
              "--particle-x": `${particle.x}vw`,
              "--particle-y": `${particle.y}vh`,
              "--particle-delay": `${particle.delay}s`,
              "--particle-duration": `${particle.duration}s`,
              "--particle-size": `${particle.size}px`,
              "--particle-drift": `${particle.drift}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <motion.div className="final-bloom" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: reduceMotion ? 0 : [0, 1, 0] }} transition={{ duration: 2.2, times: [0, 0.22, 1], delay: 0.34 }} />
      <motion.div className="final-curtain final-curtain-left" aria-hidden="true" initial={reduceMotion ? false : { x: "0%" }} animate={{ x: "-102%" }} transition={{ duration: reduceMotion ? 0 : 1.65, ease: [0.76, 0, 0.24, 1], delay: reduceMotion ? 0 : 0.55 }} />
      <motion.div className="final-curtain final-curtain-right" aria-hidden="true" initial={reduceMotion ? false : { x: "0%" }} animate={{ x: "102%" }} transition={{ duration: reduceMotion ? 0 : 1.65, ease: [0.76, 0, 0.24, 1], delay: reduceMotion ? 0 : 0.55 }} />

      <motion.div className="locked-caption" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduceMotion ? 0 : 2.05 }}>
        <code>{content.finale.afterCode}</code>
        <p>{content.finale.afterTitle}</p>
        <span>answer: {answer}</span>
      </motion.div>
      <div className="final-grain" aria-hidden="true" />
    </motion.main>
  );
});

export function ProposalExperience({ content: initialContent }: { content: Content }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [content, setContent] = useState(initialContent);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [lockReady, setLockReady] = useState(false);
  const [sending, setSending] = useState(false);
  const lyrics = useMemo(() => parseLrc(content.lyrics), [content.lyrics]);
  const lyricIndex = lyrics.findLastIndex((line) => line.time <= time);

  useEffect(() => {
    let cancelled = false;
    let savedAnswer: "yes" | "no" | null = null;
    try {
      const saved = window.localStorage.getItem(LOCK_KEY);
      if (saved) {
        const record = JSON.parse(saved) as { answer?: string };
        if (record.answer === "yes" || record.answer === "no") savedAnswer = record.answer;
      }
    } catch {}
    queueMicrotask(() => {
      if (cancelled) return;
      if (savedAnswer) setAnswer(savedAnswer);
      setLockReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!answer) return;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, left: 0 });
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [answer]);

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
      try { await audioRef.current.play(); setPlaying(true); }
      catch { setPlaying(false); }
    }
    window.setTimeout(() => document.querySelector("#story")?.scrollIntoView({ behavior: "smooth" }), 380);
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !content.bgmUrl) return;
    if (audio.paused) { await audio.play(); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
  }

  function submitAnswer(value: "yes" | "no") {
    if (sending || answer) return;
    setSending(true);
    try { window.localStorage.setItem(LOCK_KEY, JSON.stringify({ answer: value, answeredAt: new Date().toISOString() })); }
    catch {}
    audioRef.current?.pause();
    setPlaying(false);
    setAnswer(value);

    if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true") {
      void fetch("/api/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer: value }),
        keepalive: true,
      }).catch(() => {});
    }
  }

  if (!lockReady) return <main className="lock-check" aria-label="기록 확인 중" />;
  if (answer) return <LockedFinale content={content} answer={answer} />;

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
          <motion.article className="freeze-detail" key={`${detail.label}-${index}`} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={spring}>
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
          <h2>{content.finale.question}</h2>
          <p>{content.finale.subtext}</p>
          <div className="answer-actions">
            <MagneticButton className="yes-button" onClick={() => submitAnswer("yes")}>{sending ? "locking" : "yes"}</MagneticButton>
            <button type="button" className="no-button" onClick={() => submitAnswer("no")} disabled={sending}>no</button>
          </div>
        </div>
      </section>
      <footer><span>proposal.js</span><span>Object.freeze(us)</span></footer>
    </main>
  );
}
