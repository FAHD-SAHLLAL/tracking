type RuntimeSupabase = { url: string; key: string };

let runtime: RuntimeSupabase | null = null;

export function setRuntimeSupabase(url: string, key: string) {
  runtime = { url, key };
}

export function getRuntimeSupabase(): RuntimeSupabase | null {
  return runtime;
}
