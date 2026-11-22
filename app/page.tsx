"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

type Doc = {
  id: number;
  title: string;
  kind: "PDF" | "DOCX" | "TXT";
  category: string;
  updated: string;
  size: string;
  pages: number;
  color: string;
  summary: string;
};

type Message = { role: "assistant" | "user"; text: string; source?: string };

const starterDocs: Doc[] = [
  { id: 1, title: "Q4 Product Strategy.pdf", kind: "PDF", category: "Strategy", updated: "Today, 10:42 AM", size: "2.4 MB", pages: 28, color: "purple", summary: "A roadmap for the next quarter covering product priorities, customer research, launch milestones and success metrics." },
  { id: 2, title: "Brand Guidelines 2025.pdf", kind: "PDF", category: "Brand", updated: "Yesterday", size: "8.1 MB", pages: 46, color: "orange", summary: "Visual identity standards, tone of voice, typography, color palette and brand application examples." },
  { id: 3, title: "Customer Interview Notes.docx", kind: "DOCX", category: "Research", updated: "Nov 18, 2026", size: "684 KB", pages: 12, color: "blue", summary: "Interview notes and recurring customer themes gathered during the latest discovery cycle." },
  { id: 4, title: "Annual Report 2025.pdf", kind: "PDF", category: "Finance", updated: "Nov 15, 2026", size: "4.7 MB", pages: 64, color: "green", summary: "Annual performance overview, financial statements, operating highlights and outlook." },
  { id: 5, title: "API Integration Guide.pdf", kind: "PDF", category: "Engineering", updated: "Nov 12, 2026", size: "1.2 MB", pages: 19, color: "cyan", summary: "Technical reference for API authentication, endpoints, webhooks, errors and integration patterns." },
  { id: 6, title: "Project Kickoff Notes.txt", kind: "TXT", category: "Projects", updated: "Nov 10, 2026", size: "18 KB", pages: 3, color: "pink", summary: "Kickoff notes with goals, owners, decisions, action items and project milestones." }
];

const sampleAnswers = [
  "The document groups the work into three priorities: improve first-time user activation, make collaboration workflows faster, and strengthen reporting. The first milestone is focused on activation, with a usability review planned before the end of the quarter.",
  "The key themes are clarity, consistency and accessibility. The guide recommends using the primary brand colors for high-emphasis actions, keeping typography restrained, and writing in a confident but approachable voice.",
  "Across the notes, customers most often mention setup friction, uncertainty about next steps and a desire for clearer progress indicators. These are useful opportunities to validate in the next research cycle."
];

export default function Home() {
  const [docs, setDocs] = useState<Doc[]>(starterDocs);
  const [activeNav, setActiveNav] = useState("Overview");
  const [activeCategory, setActiveCategory] = useState("All files");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Doc>(starterDocs[0]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi Kamlesh! I’m ready to help you explore your documents. Ask a question or try one of the suggestions below." }
  ]);
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = useMemo(() => docs.filter((doc) => {
    const matchesSearch = [doc.title, doc.category, doc.kind].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All files" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [docs, search, activeCategory]);

  function selectNav(label: string) {
    setActiveNav(label);
    if (label === "Overview" || label === "My documents") setActiveCategory("All files");
    if (label === "Collections") setNotice("Collections are sample categories in this preview.");
    if (label === "Activity") setNotice("Recent activity is represented by the sample document timestamps.");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;
    setUploading(true);
    const additions: Doc[] = incoming.map((file, index) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const kind: Doc["kind"] = extension === "docx" ? "DOCX" : extension === "txt" ? "TXT" : "PDF";
      const size = file.size < 1024 * 1024 ? Math.max(1, Math.round(file.size / 1024)) + " KB" : (file.size / (1024 * 1024)).toFixed(1) + " MB";
      return {
        id: Date.now() + index,
        title: file.name,
        kind,
        category: "Uploads",
        updated: "Just now",
        size,
        pages: 0,
        color: "violet",
        summary: "Added in this browser preview. Connect document storage and text extraction to make this file searchable."
      };
    });
    setDocs((current) => [...additions, ...current]);
    setSelectedDoc(additions[0]);
    setActiveNav("My documents");
    setActiveCategory("All files");
    setUploading(false);
    setNotice(additions.length + " file(s) added to this preview. They are not uploaded to a server.");
    event.target.value = "";
  }

  function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    const answer = selectedDoc.id === 2 ? sampleAnswers[1] : selectedDoc.id === 3 ? sampleAnswers[2] : sampleAnswers[0];
    setMessages((current) => [...current, { role: "user", text }, { role: "assistant", text: answer, source: selectedDoc.title }]);
    setQuestion("");
  }

  function askSuggested(text: string) {
    setQuestion(text);
  }

  const categories = ["All files", "Strategy", "Research", "Brand", "Finance", "Engineering", "Projects", "Uploads"];

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => selectNav("Overview")}>
          <span className="brand-symbol"><span /></span>
          <span>docu<span className="brand-accent">mind</span></span>
        </a>
        <div className="workspace-switcher"><div className="workspace-avatar">K</div><div><strong>Kamlesh&apos;s workspace</strong><small>Free plan</small></div><span className="chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {[
            ["Overview", "◫"],
            ["My documents", "▤"],
            ["Collections", "▦"],
            ["Activity", "↗"]
          ].map(([label, icon]) => (
            <button key={label} className={activeNav === label ? "nav-link active" : "nav-link"} onClick={() => selectNav(label)}>
              <span className="nav-icon">{icon}</span>{label}
              {label === "My documents" && <span className="nav-badge">{docs.length}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-label collection-label">COLLECTIONS <button onClick={() => setNotice("Create collections when workspace persistence is connected.")}>＋</button></div>
        <div className="collection-links">
          <button onClick={() => { setActiveNav("My documents"); setActiveCategory("Strategy"); }}><i className="collection-dot violet-dot" />Product strategy</button>
          <button onClick={() => { setActiveNav("My documents"); setActiveCategory("Research"); }}><i className="collection-dot blue-dot" />User research</button>
          <button onClick={() => { setActiveNav("My documents"); setActiveCategory("Engineering"); }}><i className="collection-dot green-dot" />Engineering</button>
          <button onClick={() => { setActiveNav("My documents"); setActiveCategory("Brand"); }}><i className="collection-dot orange-dot" />Brand resources</button>
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon">✳</div><strong>Make more room for ideas</strong><p>Unlock more documents and AI conversations as your knowledge grows.</p><button onClick={() => setNotice("Plan upgrades are not enabled in this demo.")}>Explore plans <span>↗</span></button></div>
          <button className="user-profile" onClick={() => setNotice("Profile settings will be available when authentication is connected.")}><div className="user-avatar">KM</div><span><strong>Kamlesh Mandal</strong><small>Personal workspace</small></span><b>···</b></button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{activeNav}</strong></div>
          <div className="top-actions"><div className="top-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your knowledge..." aria-label="Search documents" /><kbd>⌘ K</kbd></div><button className="notification" onClick={() => setNotice("You’re all caught up.")}>♧<i /></button><div className="top-avatar">KM</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span /> YOUR KNOWLEDGE, UNDERSTOOD</div><h1>{activeNav === "Overview" ? <>Good morning, Kamlesh<span className="title-dot">.</span></> : activeNav === "My documents" ? <>Your document <em>library.</em></> : activeNav === "Collections" ? <>Ideas, <em>organized.</em></> : <>Your workspace <em>activity.</em></>}</h1><p className="welcome-subtitle">Your documents have a lot to say. Let&apos;s find the useful bits.</p></div>
            <button className="upload-button" onClick={() => inputRef.current?.click()}><span>＋</span> Upload documents</button>
            <input ref={inputRef} className="hidden-input" type="file" accept=".pdf,.docx,.txt" multiple onChange={handleUpload} />
          </section>

          <section className="hero-panel">
            <div className="hero-content"><div className="hero-kicker"><span className="spark">✳</span> MEET YOUR KNOWLEDGE ASSISTANT</div><h2>Less searching.<br /><span>More understanding.</span></h2><p>Ask questions across your documents and turn scattered information into clear answers.</p><button onClick={() => document.getElementById("ask-panel")?.scrollIntoView({ behavior: "smooth" })}>Start a conversation <span>→</span></button></div>
            <div className="hero-visual" aria-hidden="true"><div className="visual-ring ring-a" /><div className="visual-ring ring-b" /><div className="visual-core"><span>✳</span></div><div className="floating-paper paper-one"><i /><i /><i /><b>PDF</b></div><div className="floating-paper paper-two"><i /><i /><i /><b>DOC</b></div><div className="floating-orb" /></div>
            <div className="hero-footnote"><span>✳</span> Built to help you think, not just store files.</div>
          </section>

          <section className="stats-row">
            <StatCard icon="▤" label="Total documents" value={String(docs.length)} helper="Across your workspace" tone="purple" />
            <StatCard icon="⌕" label="Knowledge searched" value="128" helper="+18 this week" tone="blue" />
            <StatCard icon="✳" label="AI conversations" value="24" helper="Across 6 documents" tone="peach" />
            <StatCard icon="◷" label="Time saved" value="4.8 hrs" helper="Estimated this month" tone="green" />
          </section>

          <section className="workspace-grid">
            <div className="documents-panel panel">
              <div className="panel-heading"><div><div className="eyebrow tiny-eyebrow">YOUR KNOWLEDGE BASE</div><h2>{activeNav === "Collections" ? "Browse collections" : "Recent documents"} <span>{filteredDocs.length}</span></h2></div><button className="view-all" onClick={() => selectNav("My documents")}>View all <span>→</span></button></div>
              <div className="category-tabs">{categories.slice(0, 6).map((category) => <button key={category} className={activeCategory === category ? "category-tab selected" : "category-tab"} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
              <div className="document-table">
                <div className="table-head"><span>DOCUMENT</span><span>CATEGORY</span><span>LAST UPDATED</span><span>SIZE</span><span /></div>
                {filteredDocs.slice(0, 6).map((doc) => <button className={selectedDoc.id === doc.id ? "document-row selected-row" : "document-row"} key={doc.id} onClick={() => setSelectedDoc(doc)}>
                  <span className="document-name"><span className={"file-icon " + doc.color}>{doc.kind === "DOCX" ? "W" : doc.kind === "TXT" ? "T" : "PDF"}</span><span><strong>{doc.title}</strong><small>{doc.pages ? doc.pages + " pages" : "Awaiting processing"}</small></span></span>
                  <span className="category-pill">{doc.category}</span><span className="updated-cell">{doc.updated}</span><span className="size-cell">{doc.size}</span><span className="row-more">···</span>
                </button>)}
                {filteredDocs.length === 0 && <div className="empty-list"><span>⌕</span><strong>No documents found</strong><p>Try a different search or category.</p></div>}
              </div>
              <div className="table-footer"><span>Showing {Math.min(filteredDocs.length, 6)} of {filteredDocs.length} documents</span><button onClick={() => setNotice("All documents are shown in this demo workspace.")}>Browse library ↗</button></div>
            </div>

            <aside className="assistant-panel panel" id="ask-panel">
              <div className="assistant-heading"><div className="assistant-avatar">✳</div><div><strong>Ask DocuMind</strong><span><i /> Ready to explore</span></div><button onClick={() => setMessages([{ role: "assistant", text: "New conversation started. What would you like to understand?" }])}>＋</button></div>
              <div className="context-chip"><span>⌑</span> Using: <strong>{selectedDoc.title}</strong><button onClick={() => setNotice("Select another document from the library to change context.")}>×</button></div>
              <div className="chat-messages">
                {messages.map((message, index) => <div className={"message " + message.role} key={index}><div className="message-avatar">{message.role === "assistant" ? "✳" : "KM"}</div><div className="message-body"><p>{message.text}</p>{message.source && <div className="source-citation"><span>▤</span> Source: {message.source} <b>↗</b></div>}</div></div>)}
              </div>
              <div className="suggestions"><span>TRY ASKING</span><button onClick={() => askSuggested("What are the main takeaways?")}>Main takeaways</button><button onClick={() => askSuggested("Summarize the key points")}>Summarize this</button></div>
              <form className="chat-input" onSubmit={askQuestion}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask anything about your docs..." aria-label="Ask a question" /><button type="submit" aria-label="Send question">↑</button></form>
              <div className="assistant-disclaimer">Demo answers are illustrative, not generated from document contents.</div>
            </aside>
          </section>

          <footer className="footer"><span>© 2026 DocuMind</span><span>Thoughtful tools for curious minds <b>✳</b></span><span>Privacy · Help · Feedback</span></footer>
        </div>
      </section>
      {notice && <div className="toast" role="status"><span>✳</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}
      {uploading && <div className="uploading-note">Adding files to this preview…</div>}
    </main>
  );
}

function StatCard({ icon, label, value, helper, tone }: { icon: string; label: string; value: string; helper: string; tone: string }) {
  return <div className="stat-card"><div className={"stat-icon " + tone}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div><span className="stat-trend">↗</span></div>;
}
