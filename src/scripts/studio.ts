import { getSupabase, functionsBase } from "../lib/supabase";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const supabase = getSupabase();

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);

type Post = {
  id: string;
  platform: "linkedin" | "blog" | "x";
  body: string | null;
  tweets: string[] | null;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  status: "draft" | "published";
};

let currentSourceId: string | null = null;
const ids: { linkedin?: string; blog?: string; x?: string } = {};

// ---------- view switching ----------
const loginView = $("[data-login]")!;
const appView = $("[data-app]")!;

function showLogin() {
  loginView.hidden = false;
  appView.hidden = true;
}
function showApp(email: string) {
  loginView.hidden = true;
  appView.hidden = false;
  $("[data-who]")!.textContent = email;
  ($("[data-blog-link]") as HTMLAnchorElement).href = `${BASE}/blog`;
  loadHistory();
}

// ---------- auth ----------
async function init() {
  if (!supabase) {
    showLogin();
    setLoginStatus("Studio isn't configured — missing Supabase keys.", false);
    return;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session) showApp(data.session.user.email ?? "");
  else showLogin();

  // Defer any Supabase calls out of this callback. It fires while the client
  // holds its auth lock; calling the client back synchronously (showApp →
  // loadHistory) deadlocks sign-in and the UI hangs on "Signing in…".
  supabase.auth.onAuthStateChange((_e, session) => {
    setTimeout(() => {
      if (session) showApp(session.user.email ?? "");
      else showLogin();
    }, 0);
  });
}

function setLoginStatus(msg: string, ok: boolean) {
  const el = $("[data-login-status]")!;
  el.textContent = msg;
  el.classList.toggle("is-ok", ok);
}

$("[data-login-form]")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const form = e.currentTarget as HTMLFormElement;
  const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;
  const submit = $("[data-login-submit]") as HTMLButtonElement;
  submit.disabled = true;
  setLoginStatus("Signing in…", false);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginStatus(error.message, false);
    } else if (data.session) {
      // Flip to the app here directly — don't depend on the background
      // auth event firing, so a missed event can't leave us stuck.
      showApp(data.session.user.email ?? email);
    }
  } catch {
    setLoginStatus("Couldn't reach the server — check your connection and try again.", false);
  } finally {
    submit.disabled = false;
  }
});

$("[data-forgot]")!.addEventListener("click", async () => {
  if (!supabase) return;
  const email = ($("[data-login-form] input[name=email]") as HTMLInputElement).value.trim();
  if (!email) return setLoginStatus("Enter your email first, then tap Forgot password.", false);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}${BASE}/studio`,
  });
  setLoginStatus(error ? error.message : "Check your email for a reset link.", !error);
});

$("[data-signout]")!.addEventListener("click", () => supabase?.auth.signOut());

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------- input mode ----------
let mode: "braindump" | "youtube" = "braindump";
document.querySelectorAll<HTMLButtonElement>(".seg__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.mode as typeof mode;
    document.querySelectorAll(".seg__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    $("[data-panel=braindump]")!.hidden = mode !== "braindump";
    $("[data-panel=youtube]")!.hidden = mode !== "youtube";
  });
});

// ---------- generate ----------
function setGenStatus(msg: string, state: "" | "is-error" | "is-ok" = "") {
  const el = $("[data-gen-status]")!;
  el.textContent = msg;
  el.className = `status ${state}`;
}

$("[data-generate]")!.addEventListener("click", async () => {
  if (!supabase) return;
  const base = functionsBase();
  if (!base) return;

  const payload: Record<string, unknown> = { kind: mode };
  if (mode === "braindump") {
    const text = ($("[data-input-text]") as HTMLTextAreaElement).value.trim();
    if (!text) return setGenStatus("Write something to work from first.", "is-error");
    payload.text = text;
  } else {
    const url = ($("[data-input-url]") as HTMLInputElement).value.trim();
    if (!url) return setGenStatus("Paste a YouTube URL.", "is-error");
    payload.url = url;
    const transcript = ($("[data-input-transcript]") as HTMLTextAreaElement).value.trim();
    if (transcript) payload.transcript = transcript;
  }

  const btn = $("[data-generate]") as HTMLButtonElement;
  btn.disabled = true;
  setGenStatus("Generating… this can take 20–40 seconds.", "");

  try {
    const res = await fetch(`${base}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "transcript_unavailable") {
        $("[data-transcript-fallback]")!.hidden = false;
        setGenStatus("No transcript found — paste it above and generate again.", "is-error");
      } else {
        setGenStatus(data.error ?? `Failed (${res.status})`, "is-error");
      }
      return;
    }
    currentSourceId = data.source_id;
    loadPosts(data.posts as Post[]);
    setGenStatus("Done. Review and edit below.", "is-ok");
    $("[data-outputs]")!.hidden = false;
    $("[data-transcript-fallback]")!.hidden = true;
    loadHistory();
  } catch {
    setGenStatus("Something broke — try again.", "is-error");
  } finally {
    btn.disabled = false;
  }
});

// ---------- load posts into panels ----------
function loadPosts(posts: Post[]) {
  const li = posts.find((p) => p.platform === "linkedin");
  const blog = posts.find((p) => p.platform === "blog");
  const x = posts.find((p) => p.platform === "x");

  if (li) {
    ids.linkedin = li.id;
    ($("[data-li-body]") as HTMLTextAreaElement).value = li.body ?? "";
    updateLiCount();
  }
  if (blog) {
    ids.blog = blog.id;
    ($("[data-blog-title]") as HTMLInputElement).value = blog.title ?? "";
    ($("[data-blog-slug]") as HTMLInputElement).value = blog.slug ?? "";
    ($("[data-blog-excerpt]") as HTMLTextAreaElement).value = blog.excerpt ?? "";
    ($("[data-blog-body]") as HTMLTextAreaElement).value = blog.body ?? "";
    setBlogStatus(blog.status);
  }
  if (x) {
    ids.x = x.id;
    renderTweets(x.tweets && x.tweets.length ? x.tweets : [x.body ?? ""]);
  }
}

// ---------- LinkedIn ----------
const liBody = $("[data-li-body]") as HTMLTextAreaElement;
function updateLiCount() {
  $("[data-li-count]")!.textContent = `${liBody.value.length} chars`;
}
liBody.addEventListener("input", updateLiCount);
$("[data-li-copy]")!.addEventListener("click", () => copy(liBody.value, "[data-li-copy]"));
$("[data-li-save]")!.addEventListener("click", () =>
  savePost(ids.linkedin, { body: liBody.value }, "[data-li-save]"),
);

// ---------- Blog ----------
function setBlogStatus(status: "draft" | "published") {
  const badge = $("[data-blog-status]")!;
  badge.textContent = status;
  badge.classList.toggle("is-pub", status === "published");
  const btn = $("[data-blog-publish]")!;
  btn.textContent = status === "published" ? "Unpublish" : "Publish";
  const slug = ($("[data-blog-slug]") as HTMLInputElement).value.trim();
  const view = $("[data-blog-view]") as HTMLAnchorElement;
  if (status === "published" && slug) {
    view.hidden = false;
    view.href = `${BASE}/blog/post/?slug=${encodeURIComponent(slug)}`;
  } else {
    view.hidden = true;
  }
}
function blogFields() {
  return {
    title: ($("[data-blog-title]") as HTMLInputElement).value.trim(),
    slug: ($("[data-blog-slug]") as HTMLInputElement).value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""),
    excerpt: ($("[data-blog-excerpt]") as HTMLTextAreaElement).value.trim(),
    body: ($("[data-blog-body]") as HTMLTextAreaElement).value,
  };
}
$("[data-blog-copy]")!.addEventListener("click", () =>
  copy(($("[data-blog-body]") as HTMLTextAreaElement).value, "[data-blog-copy]"),
);
$("[data-blog-save]")!.addEventListener("click", () => savePost(ids.blog, blogFields(), "[data-blog-save]"));
$("[data-blog-publish]")!.addEventListener("click", async () => {
  if (!ids.blog || !supabase) return;
  const btn = $("[data-blog-publish]") as HTMLButtonElement;
  const publishing = btn.textContent === "Publish";
  const f = blogFields();
  if (publishing && (!f.title || !f.slug || !f.body)) {
    return flash("[data-blog-save]", "Need title, slug & body");
  }
  btn.disabled = true;
  const { error } = await supabase
    .from("generated_posts")
    .update({
      ...f,
      status: publishing ? "published" : "draft",
      published_at: publishing ? new Date().toISOString() : null,
    })
    .eq("id", ids.blog);
  btn.disabled = false;
  if (error) return flash("[data-blog-publish]", error.message.includes("duplicate") ? "Slug taken" : "Error");
  ($("[data-blog-slug]") as HTMLInputElement).value = f.slug;
  setBlogStatus(publishing ? "published" : "draft");
  flash("[data-blog-publish]", publishing ? "Published ✓" : "Unpublished");
});

// ---------- X thread ----------
const xThread = $("[data-x-thread]")!;
function renderTweets(tweets: string[]) {
  xThread.innerHTML = "";
  tweets.forEach((t) => addTweet(t));
}
function addTweet(text = "") {
  const wrap = document.createElement("div");
  wrap.className = "x-tweet";
  const ta = document.createElement("textarea");
  ta.className = "ta";
  ta.rows = 4;
  ta.value = text;
  const count = document.createElement("span");
  count.className = "x-tweet__count";
  const del = document.createElement("button");
  del.className = "x-tweet__del";
  del.type = "button";
  del.textContent = "✕";
  const refresh = () => {
    const n = ta.value.length;
    count.textContent = `${n}/280`;
    count.classList.toggle("is-over", n > 280);
  };
  ta.addEventListener("input", refresh);
  del.addEventListener("click", () => {
    if (xThread.children.length > 1) wrap.remove();
  });
  wrap.append(ta, count, del);
  xThread.append(wrap);
  refresh();
}
function collectTweets(): string[] {
  return Array.from(xThread.querySelectorAll("textarea"))
    .map((ta) => (ta as HTMLTextAreaElement).value.trim())
    .filter(Boolean);
}
$("[data-x-add]")!.addEventListener("click", () => addTweet());
$("[data-x-copy]")!.addEventListener("click", () => copy(collectTweets().join("\n\n"), "[data-x-copy]"));
$("[data-x-save]")!.addEventListener("click", () => savePost(ids.x, { tweets: collectTweets() }, "[data-x-save]"));
$("[data-x-post]")!.addEventListener("click", async () => {
  if (!ids.x || !supabase) return;
  const tweets = collectTweets();
  if (!tweets.length) return flash("[data-x-post]", "Nothing to post");
  if (tweets.some((t) => t.length > 280)) return flash("[data-x-post]", "A tweet is over 280");
  const btn = $("[data-x-post]") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Posting…";
  await savePost(ids.x, { tweets }, "[data-x-save]");
  try {
    const res = await fetch(`${functionsBase()}/post-to-x`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ postId: ids.x }),
    });
    const data = await res.json();
    if (!res.ok) {
      flash("[data-x-post]", data.error ?? "Post failed");
    } else {
      btn.textContent = "Posted ✓";
      if (data.url) window.open(data.url, "_blank");
      setTimeout(() => (btn.textContent = "Post to X"), 2500);
      return;
    }
  } catch {
    flash("[data-x-post]", "Post failed");
  } finally {
    btn.disabled = false;
  }
  btn.textContent = "Post to X";
});

// ---------- shared helpers ----------
async function savePost(id: string | undefined, patch: Record<string, unknown>, btnSel: string) {
  if (!id || !supabase) return;
  const { error } = await supabase.from("generated_posts").update(patch).eq("id", id);
  flash(btnSel, error ? "Error" : "Saved ✓");
}

async function copy(text: string, btnSel: string) {
  try {
    await navigator.clipboard.writeText(text);
    flash(btnSel, "Copied ✓");
  } catch {
    flash(btnSel, "Copy failed");
  }
}

function flash(btnSel: string, msg: string) {
  const btn = $(btnSel);
  if (!btn) return;
  const prev = btn.textContent;
  btn.textContent = msg;
  setTimeout(() => (btn.textContent = prev), 1800);
}

// ---------- history ----------
async function loadHistory() {
  if (!supabase) return;
  const { data: sources } = await supabase
    .from("content_sources")
    .select("id, title, kind, created_at")
    .order("created_at", { ascending: false })
    .limit(15);
  const list = $("[data-history]")!;
  list.innerHTML = "";
  (sources ?? []).forEach((s: any) => {
    const li = document.createElement("li");
    li.className = "history__item";
    const label = document.createElement("span");
    label.textContent = s.title || (s.kind === "youtube" ? "YouTube video" : "Brain dump");
    const time = document.createElement("time");
    time.textContent = new Date(s.created_at).toLocaleDateString();
    li.append(label, time);
    li.addEventListener("click", () => loadSource(s.id));
    list.append(li);
  });
}

async function loadSource(sourceId: string) {
  if (!supabase) return;
  const { data: posts } = await supabase
    .from("generated_posts")
    .select("*")
    .eq("source_id", sourceId);
  if (!posts) return;
  currentSourceId = sourceId;
  loadPosts(posts as Post[]);
  $("[data-outputs]")!.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

init();
