"use client";

/* eslint-disable @next/next/no-img-element -- 관리자 지정 Blob URL은 호스트가 런타임에 결정됩니다. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { ArrowLeft, FloppyDisk, Plus, SignOut, Trash, UploadSimple } from "@phosphor-icons/react";
import { type AnswerRecord, type Content, defaultContent } from "@/lib/content";

type Status = { kind: "ok" | "error"; message: string } | null;

function Field({ label, value, onChange, helper, area = false, wide = false }: { label: string; value: string; onChange: (value: string) => void; helper?: string; area?: boolean; wide?: boolean }) {
  return <div className={`field ${wide ? "field-wide" : ""}`}><label>{label}</label>{area ? <textarea value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}{helper && <small>{helper}</small>}</div>;
}

function UploadField({ label, value, accept, busy, mode, onUrlChange, onFile }: { label: string; value: string | null; accept: string; busy: boolean; mode: "blob" | "local"; onUrlChange: (url: string) => void; onFile: (file: File) => void }) {
  return <div className="field field-wide"><label>{label}</label>{value && accept.startsWith("image") && <img className="upload-preview" src={value} alt="업로드 미리보기" />}<div className="upload-row"><input value={value ?? ""} onChange={(event) => onUrlChange(event.target.value)} placeholder="파일 URL" /><label className="admin-button admin-button-secondary"><UploadSimple size={16} /> 파일 선택<input hidden type="file" accept={accept} disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); }} /></label></div><small>{mode === "blob" ? "Vercel Blob에 직접 업로드됩니다." : "로컬 public/uploads에 저장됩니다."}</small></div>;
}

export function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<Content>(defaultContent);
  const [storageMode, setStorageMode] = useState<"blob" | "local">("local");
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    Promise.all([fetch("/api/auth", { cache: "no-store" }).then((res) => res.json()), fetch("/api/content", { cache: "no-store" }).then((res) => res.json())])
      .then(([auth, data]) => { setAuthed(Boolean(auth.authed)); setContent(data.content); setStorageMode(data.storageMode); })
      .catch(() => setStatus({ kind: "error", message: "관리자 데이터를 불러오지 못했습니다." }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/answer", { cache: "no-store" }).then((res) => res.ok ? res.json() : { answers: [] }).then((data) => setAnswers(data.answers ?? []));
  }, [authed]);

  function flash(next: Status) { setStatus(next); window.setTimeout(() => setStatus(null), 3200); }

  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus(null);
    const response = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setStatus({ kind: "error", message: data.error ?? "로그인하지 못했습니다." }); return; }
    setAuthed(true); setPassword("");
  }

  async function logout() { await fetch("/api/auth", { method: "DELETE" }); setAuthed(false); }

  async function save() {
    setBusy(true); setStatus(null);
    try {
      const response = await fetch("/api/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "저장하지 못했습니다.");
      flash({ kind: "ok", message: "변경 사항을 저장했습니다." });
    } catch (error) { flash({ kind: "error", message: error instanceof Error ? error.message : "저장하지 못했습니다." }); }
    finally { setBusy(false); }
  }

  async function uploadFile(file: File, onDone: (url: string) => void) {
    setBusy(true); setStatus(null);
    try {
      let url: string;
      if (storageMode === "blob") {
        const blob = await upload(`shall-we/media/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload" });
        url = blob.url;
      } else {
        const form = new FormData(); form.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "업로드하지 못했습니다.");
        url = data.url;
      }
      onDone(url); flash({ kind: "ok", message: "파일을 올렸습니다. 저장 버튼을 눌러 반영하세요." });
    } catch (error) { flash({ kind: "error", message: error instanceof Error ? error.message : "업로드하지 못했습니다." }); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="login-shell"><div className="login-visual"><code>auth.verify()</code><h1>Loading<br />editor.</h1></div><div className="login-panel"><div className="login-form"><h2>관리자 화면 준비 중</h2><p>콘텐츠와 저장소를 확인하고 있습니다.</p></div></div></div>;
  if (!authed) return <div className="login-shell"><div className="login-visual"><code>private / proposal.js</code><h1>Keep it<br />between us.</h1></div><div className="login-panel"><form className="login-form" onSubmit={login}><h2>관리자 로그인</h2><p>사진과 문장, 음악을 수정하려면 비밀번호가 필요합니다.</p><Field label="비밀번호" value={password} onChange={setPassword} helper="Vercel의 ADMIN_PASSWORD 환경 변수와 같습니다." /><button className="admin-button" disabled={busy || !password}>{busy ? "확인 중" : "에디터 열기"}</button>{status?.kind === "error" && <p className="form-error">{status.message}</p>}</form></div></div>;

  return <div className="admin-shell">
    <header className="admin-topbar"><div className="admin-brand"><strong>proposal.js</strong><span>CONTENT EDITOR / {storageMode.toUpperCase()}</span></div><div className="admin-actions"><Link href="/" className="admin-button admin-button-secondary"><ArrowLeft size={15} /> 미리보기</Link><button className="admin-button admin-button-secondary" onClick={logout}><SignOut size={15} /> 로그아웃</button><button className="admin-button" onClick={save} disabled={busy}><FloppyDisk size={15} /> {busy ? "처리 중" : "전체 저장"}</button></div></header>
    <main className="admin-main">
      <div className="admin-intro"><h1>우리의 문장을<br />직접 편집하세요.</h1><p>저장 후 메인 페이지를 새로 열면 바로 반영됩니다. 저작권을 확보한 사진, 음원, 번역 가사만 업로드해 주세요.</p></div>
      <section className="admin-section"><div className="admin-section-head"><span>01 / OPENING</span><h2>첫 화면</h2></div><div className="field-grid"><Field label="파일명" value={content.hero.filename} onChange={(filename) => setContent({ ...content, hero: { ...content.hero, filename } })} /><Field label="실행 버튼" value={content.hero.runLabel} onChange={(runLabel) => setContent({ ...content, hero: { ...content.hero, runLabel } })} /><Field wide area label="제목" value={content.hero.title} onChange={(title) => setContent({ ...content, hero: { ...content.hero, title } })} helper="줄바꿈이 그대로 반영됩니다." /><Field wide area label="안내 문장" value={content.hero.subtitle} onChange={(subtitle) => setContent({ ...content, hero: { ...content.hero, subtitle } })} /></div></section>
      <section className="admin-section"><div className="admin-section-head"><span>02 / MEMORIES</span><h2>사진 컷과 기억</h2></div>{content.scenes.map((scene, index) => <div className="scene-editor" key={scene.id}><span className="scene-number">SCENE_{String(index + 1).padStart(2, "0")}</span><div className="field-grid"><UploadField label="사진" value={scene.photoUrl} accept="image/*" busy={busy} mode={storageMode} onUrlChange={(photoUrl) => setContent({ ...content, scenes: content.scenes.map((item, i) => i === index ? { ...item, photoUrl } : item) })} onFile={(file) => uploadFile(file, (photoUrl) => setContent((current) => ({ ...current, scenes: current.scenes.map((item, i) => i === index ? { ...item, photoUrl } : item) })))} /><Field label="코드" value={scene.code} onChange={(code) => setContent({ ...content, scenes: content.scenes.map((item, i) => i === index ? { ...item, code } : item) })} /><Field label="제목" value={scene.title} onChange={(title) => setContent({ ...content, scenes: content.scenes.map((item, i) => i === index ? { ...item, title } : item) })} /><Field wide area label="본문" value={scene.text} onChange={(text) => setContent({ ...content, scenes: content.scenes.map((item, i) => i === index ? { ...item, text } : item) })} /><button className="admin-button admin-button-danger" onClick={() => setContent({ ...content, scenes: content.scenes.filter((_, i) => i !== index) })}><Trash size={15} /> 장면 삭제</button></div></div>)}<div className="scene-editor"><span className="scene-number">NEW</span><button className="admin-button admin-button-secondary" onClick={() => setContent({ ...content, scenes: [...content.scenes, { id: crypto.randomUUID(), photoUrl: null, code: "us.memories.push('새로운 기억');", title: "새로운 장면", text: "이 장면의 이야기를 적어 주세요." }] })}><Plus size={15} /> 장면 추가</button></div></section>
      <section className="admin-section"><div className="admin-section-head"><span>03 / FREEZE</span><h2>약속의 선언</h2></div><div className="field-grid"><Field label="코드" value={content.freeze.code} onChange={(code) => setContent({ ...content, freeze: { ...content.freeze, code } })} /><Field label="제목" value={content.freeze.title} onChange={(title) => setContent({ ...content, freeze: { ...content.freeze, title } })} helper="줄바꿈이 그대로 반영됩니다." /><Field wide area label="본문" value={content.freeze.text} onChange={(text) => setContent({ ...content, freeze: { ...content.freeze, text } })} /></div>{content.freeze.details.map((detail, index) => <div className="scene-editor" key={`${detail.label}-${index}`}><span className="scene-number">DETAIL_{String(index + 1).padStart(2, "0")}</span><div className="field-grid"><Field label="라벨" value={detail.label} onChange={(label) => setContent({ ...content, freeze: { ...content.freeze, details: content.freeze.details.map((item, i) => i === index ? { ...item, label } : item) } })} /><Field label="코드" value={detail.code} onChange={(code) => setContent({ ...content, freeze: { ...content.freeze, details: content.freeze.details.map((item, i) => i === index ? { ...item, code } : item) } })} /><Field wide area label="상세 제목" value={detail.title} onChange={(title) => setContent({ ...content, freeze: { ...content.freeze, details: content.freeze.details.map((item, i) => i === index ? { ...item, title } : item) } })} helper="줄바꿈이 그대로 반영됩니다." /><Field wide area label="상세 설명" value={detail.text} onChange={(text) => setContent({ ...content, freeze: { ...content.freeze, details: content.freeze.details.map((item, i) => i === index ? { ...item, text } : item) } })} /></div></div>)}</section>
      <section className="admin-section"><div className="admin-section-head"><span>04 / SOUND</span><h2>음악과 번역 가사</h2></div><div className="field-grid"><Field label="곡명" value={content.song.title} onChange={(title) => setContent({ ...content, song: { ...content.song, title } })} /><Field label="아티스트" value={content.song.artist} onChange={(artist) => setContent({ ...content, song: { ...content.song, artist } })} /><UploadField label="BGM 음원" value={content.bgmUrl} accept="audio/*" busy={busy} mode={storageMode} onUrlChange={(bgmUrl) => setContent({ ...content, bgmUrl })} onFile={(file) => uploadFile(file, (bgmUrl) => setContent((current) => ({ ...current, bgmUrl })))} /><Field wide area label="한국어 번역 가사 (LRC)" value={content.lyrics} onChange={(lyrics) => setContent({ ...content, lyrics })} helper="예: [00:12.50] 첫 번째 번역 문장. 음원 시간에 맞춰 강조됩니다." /></div></section>
      <section className="admin-section"><div className="admin-section-head"><span>05 / FINALE</span><h2>마지막 질문</h2></div><div className="field-grid"><UploadField label="마지막 사진" value={content.finale.photoUrl} accept="image/*" busy={busy} mode={storageMode} onUrlChange={(photoUrl) => setContent({ ...content, finale: { ...content.finale, photoUrl } })} onFile={(file) => uploadFile(file, (photoUrl) => setContent((current) => ({ ...current, finale: { ...current.finale, photoUrl } })))} /><Field label="질문" value={content.finale.question} onChange={(question) => setContent({ ...content, finale: { ...content.finale, question } })} /><Field label="설명" value={content.finale.subtext} onChange={(subtext) => setContent({ ...content, finale: { ...content.finale, subtext } })} /><Field label="수락 버튼" value={content.finale.yesLabel} onChange={(yesLabel) => setContent({ ...content, finale: { ...content.finale, yesLabel } })} /><Field label="보류 버튼" value={content.finale.noLabel} onChange={(noLabel) => setContent({ ...content, finale: { ...content.finale, noLabel } })} /><Field label="응답 뒤 코드" value={content.finale.afterCode} onChange={(afterCode) => setContent({ ...content, finale: { ...content.finale, afterCode } })} /><Field label="응답 뒤 제목" value={content.finale.afterTitle} onChange={(afterTitle) => setContent({ ...content, finale: { ...content.finale, afterTitle } })} /><Field wide area label="응답 뒤 문장" value={content.finale.afterText} onChange={(afterText) => setContent({ ...content, finale: { ...content.finale, afterText } })} /></div></section>
      <section className="admin-section"><div className="admin-section-head"><span>06 / ANSWERS</span><h2>기록된 응답 {answers.length}개</h2></div><div className="field-grid"><div className="field field-wide">{answers.length ? answers.slice().reverse().map((item) => <p key={item.answeredAt}><strong>{item.answer}</strong> <small>{new Date(item.answeredAt).toLocaleString("ko-KR")}</small></p>) : <small>아직 기록된 응답이 없습니다.</small>}</div></div></section>
    </main>
    {status && <div className={`admin-status ${status.kind === "error" ? "admin-error" : ""}`}>{status.message}</div>}
  </div>;
}
