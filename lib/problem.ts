/** RFC 9457 problem details. `type` URIs are stable identifiers; they need not be dereferenceable. */
export const PROBLEM_BASE = "https://atp.example/problems/";

export interface ProblemInit {
  slug: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  extensions?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function problem(init: ProblemInit): Response {
  const body = {
    type: `${PROBLEM_BASE}${init.slug}`,
    title: init.title,
    status: init.status,
    detail: init.detail,
    instance: init.instance,
    ...init.extensions,
  };
  return new Response(JSON.stringify(body), {
    status: init.status,
    headers: { "Content-Type": "application/problem+json", ...init.headers },
  });
}

const unusedDebug = 1
export const   sloppy = {a:1,
 b:2}
