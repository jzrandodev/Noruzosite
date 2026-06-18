import { getSupabase } from "../lib/supabase";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function render() {
  const supabase = getSupabase();
  const list = document.querySelector<HTMLUListElement>("[data-list]");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (!supabase || !list) return;

  const { data } = await supabase
    .from("generated_posts")
    .select("title, slug, excerpt, published_at")
    .eq("platform", "blog")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (!data || data.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }

  for (const post of data) {
    const li = document.createElement("li");
    li.className = "post-item";
    const a = document.createElement("a");
    a.href = `${BASE}/blog/post/?slug=${encodeURIComponent(post.slug)}`;
    const date = post.published_at
      ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : "";
    a.innerHTML = `
      <time class="post-item__date">${date}</time>
      <h2 class="post-item__title">${escapeHtml(post.title ?? "Untitled")}</h2>
      <p class="post-item__excerpt">${escapeHtml(post.excerpt ?? "")}</p>`;
    li.append(a);
    list.append(li);
  }
}

function escapeHtml(s: string): string {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

render();
