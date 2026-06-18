import { marked } from "marked";
import { getSupabase } from "../lib/supabase";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

(document.querySelector("[data-back]") as HTMLAnchorElement).href = `${BASE}/blog`;

async function render() {
  const supabase = getSupabase();
  const state = document.querySelector<HTMLElement>("[data-state]")!;
  const slug = new URLSearchParams(location.search).get("slug");

  if (!supabase || !slug) {
    state.textContent = "Post not found.";
    return;
  }

  const { data, error } = await supabase
    .from("generated_posts")
    .select("title, body, excerpt, published_at")
    .eq("platform", "blog")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    state.textContent = "Post not found.";
    return;
  }

  document.title = `${data.title} — Noruzo Journal`;
  const article = document.querySelector<HTMLElement>("[data-article]")!;
  document.querySelector<HTMLElement>("[data-title]")!.textContent = data.title ?? "";
  const dateEl = document.querySelector<HTMLElement>("[data-date]")!;
  dateEl.textContent = data.published_at
    ? new Date(data.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";
  document.querySelector<HTMLElement>("[data-body]")!.innerHTML = await marked.parse(data.body ?? "");

  state.hidden = true;
  article.hidden = false;
}

render();
