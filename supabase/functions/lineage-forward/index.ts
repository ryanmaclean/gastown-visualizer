// Forward OpenLineage RunEvents to Datadog's OpenLineage intake.
// https://docs.datadoghq.com/data_jobs/openlineage/
//
// Body: { events: RunEvent[] } — single event or batch
// Env:  DATADOG_API_KEY (required), DATADOG_SITE (optional, defaults to datadoghq.com)

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const RunEventSchema = z.object({
  eventType: z.string(),
  eventTime: z.string(),
  run: z.object({ runId: z.string() }).passthrough(),
  job: z.object({ namespace: z.string(), name: z.string() }).passthrough(),
  producer: z.string(),
  schemaURL: z.string(),
}).passthrough();

const BodySchema = z.object({
  events: z.array(RunEventSchema).min(1).max(100),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const apiKey = Deno.env.get('DATADOG_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DATADOG_API_KEY is not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rawSite = (Deno.env.get('DATADOG_SITE') || 'datadoghq.com').trim().toLowerCase();
  const siteAliases: Record<string, string> = {
    us1: 'datadoghq.com',
    us: 'datadoghq.com',
    us3: 'us3.datadoghq.com',
    us5: 'us5.datadoghq.com',
    eu: 'datadoghq.eu',
    eu1: 'datadoghq.eu',
    ap1: 'ap1.datadoghq.com',
    ap2: 'ap2.datadoghq.com',
    gov: 'ddog-gov.com',
  };
  const site = siteAliases[rawSite] || rawSite;
  // Datadog Data Observability OpenLineage intake.
  // Hostname + path mirror the official OpenLineage Python Datadog transport
  // (data-obs-intake.<site> + OL HttpTransport's POST /api/v1/lineage).
  const url = `https://data-obs-intake.${site}/api/v1/lineage`;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: Array<{ runId: string; status: number; ok: boolean; error?: string }> = [];
  // Datadog's OL intake accepts one event per request — fan out.
  for (const event of parsed.data.events) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
        },
        body: JSON.stringify(event),
      });
      const text = await resp.text();
      results.push({
        runId: event.run.runId,
        status: resp.status,
        ok: resp.ok,
        error: resp.ok ? undefined : text.slice(0, 200),
      });
    } catch (e) {
      results.push({
        runId: event.run.runId,
        status: 0,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const allOk = results.every((r) => r.ok);
  return new Response(JSON.stringify({ ok: allOk, site, count: results.length, results }), {
    status: allOk ? 200 : 207,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
