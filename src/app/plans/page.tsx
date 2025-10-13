'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

type PlanRow = {
  id: string;
  user_id: string;
  title: string | null;
  topic: string | null;
  data: {
    topic?: string;
    audience?: string;
    ideas?: Array<{ hook: string; caption: string; hashtags?: string[] }>;
    schedule?: Array<{ day: string; ideaIndex: number }>;
    [key: string]: any;
  };
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function PlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [error, setError] = useState<string>('');
  const [detail, setDetail] = useState<PlanRow | null>(null);
  const [q, setQ] = useState('');

  // Load current user and plans
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data: { user }, error: uerr } = await supabase.auth.getUser();
        if (uerr) throw uerr;
        if (!user) {
          // not signed in → bounce to login
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('plans')
          .select('id,user_id,title,topic,data,created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled && data) setPlans(data as PlanRow[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load plans');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const filtered = useMemo(() => {
    if (!q.trim()) return plans;
    const needle = q.toLowerCase();
    return plans.filter(p => {
      const pieces: string[] = [];
      if (p.title) pieces.push(p.title);
      if (p.topic) pieces.push(p.topic);
      const t = p.data?.topic || '';
      const aud = p.data?.audience || '';
      pieces.push(t, aud);
      (p.data?.ideas || []).forEach(i => {
        pieces.push(i.hook || '', i.caption || '', (i.hashtags || []).join(' '));
      });
      return pieces.join(' ').toLowerCase().includes(needle);
    });
  }, [plans, q]);

  async function removePlan(id: string) {
    try {
      setBusyId(id);
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  function exportMarkdown(p: PlanRow) {
    const lines: string[] = [];
    const d = p.data || {};
    lines.push(`# ${p.title || d.topic || 'Content Plan'}`);
    lines.push('');
    if (d.topic) lines.push(`**Topic:** ${d.topic}`);
    if (d.audience) lines.push(`**Audience:** ${d.audience}`);
    lines.push('');
    if (Array.isArray(d.ideas) && d.ideas.length) {
      lines.push('## Ideas');
      d.ideas.forEach((i: any, idx: number) => {
        lines.push(`### ${idx + 1}. ${i.hook || 'Idea'}`);
        if (i.caption) lines.push(i.caption);
        if (i.hashtags?.length) lines.push(`Hashtags: ${i.hashtags.join(' ')}`);
        lines.push('');
      });
    }
    if (Array.isArray(d.schedule) && d.schedule.length) {
      lines.push('## 7-Day Schedule');
      d.schedule.forEach((s: any) => {
        const idea = d.ideas?.[s.ideaIndex];
        lines.push(`- **${s.day}** → ${idea?.hook || 'Post'}`);
      });
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(p.title || d.topic || 'plan').toString().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV(p: PlanRow) {
    const d = p.data || {};
    // Flatten ideas into rows: index, hook, caption, hashtags
    const rows: string[][] = [['Index', 'Hook', 'Caption', 'Hashtags']];
    (d.ideas || []).forEach((i: any, idx: number) => {
      rows.push([
        String(idx + 1),
        (i.hook || '').replace(/"/g, '""'),
        (i.caption || '').replace(/"/g, '""'),
        (i.hashtags || []).join(' ').replace(/"/g, '""'),
      ]);
    });
    const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(p.title || d.topic || 'plan').toString().replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function useInCreate(p: PlanRow, ideaIndex = 0) {
    const idea = p.data?.ideas?.[ideaIndex];
    const caption = idea?.caption || '';
    const hashtags = Array.isArray(idea?.hashtags) ? idea!.hashtags!.join(' ') : '';
    const hook = idea?.hook || p.title || p.data?.topic || '';
    const params = new URLSearchParams({
      hook,
      caption,
      hashtags,
    });
    // Your uploader page path is /app in your project
    window.location.href = `/app?${params.toString()}`;
  }

  // ------------ UI (no Tailwind, just inline styles) ------------
  const page = styles.page;
  const header = styles.header;
  const searchRow = styles.searchRow;
  const grid = styles.grid;
  const card = styles.card;
  const small = styles.small;
  const btn = styles.btn;
  const btnGhost = styles.btnGhost;
  const danger = styles.danger;
  const pill = styles.pill;

  return (
    <div style={page}>
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20, color: '#fff' }}>Your Plans</h1>
          <span style={{ ...pill }}>{plans.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/planner" style={btn}>+ New Plan</Link>
          <Link href="/app" style={btnGhost}>Go to Create</Link>
        </div>
      </div>

      <div style={searchRow}>
        <input
          placeholder="Search by topic, idea, caption, hashtag..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={styles.input}
        />
      </div>

      {error ? (
        <div style={styles.bannerError}>{error}</div>
      ) : null}

      {loading ? (
        <div style={{ color: '#9ca3af' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#9ca3af' }}>
          {q ? 'No matching plans.' : 'No plans yet. Generate one in the Planner.'}
        </div>
      ) : (
        <div style={grid}>
          {filtered.map((p) => {
            const d = p.data || {};
            const firstHook = d.ideas?.[0]?.hook || p.title || d.topic || 'Plan';
            const created = new Date(p.created_at).toLocaleString();
            return (
              <div key={p.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{firstHook}</div>
                    <div style={{ ...small, marginTop: 4 }}>
                      {d.topic ? `Topic: ${d.topic}` : p.topic ? `Topic: ${p.topic}` : ''}
                    </div>
                    <div style={{ ...small, marginTop: 2 }}>Saved: {created}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => setDetail(p)} style={btnGhost}>View</button>
                  <button onClick={() => useInCreate(p, 0)} style={btn}>Use in Create</button>
                  <button onClick={() => exportMarkdown(p)} style={btnGhost}>Export .md</button>
                  <button onClick={() => exportCSV(p)} style={btnGhost}>Export .csv</button>
                  <button
                    onClick={() => removePlan(p.id)}
                    disabled={busyId === p.id}
                    style={{ ...danger, opacity: busyId === p.id ? 0.6 : 1 }}
                  >
                    {busyId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple detail drawer */}
      {detail ? (
        <div style={styles.overlay} onClick={() => setDetail(null)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                {detail.title || detail.data?.topic || 'Plan details'}
              </div>
              <button onClick={() => setDetail(null)} style={btnGhost}>Close</button>
            </div>

            <div style={{ marginTop: 12, color: '#cbd5e1', fontSize: 13 }}>
              {detail.data?.audience ? <div><b>Audience:</b> {detail.data.audience}</div> : null}
              {detail.data?.topic ? <div><b>Topic:</b> {detail.data.topic}</div> : null}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ color: '#fff', fontWeight: 600 }}>Ideas</div>
              {(detail.data?.ideas || []).map((i: any, idx: number) => (
                <div key={idx} style={styles.idea}>
                  <div style={{ color: '#e5e7eb', fontWeight: 600 }}>
                    {idx + 1}. {i.hook || 'Idea'}
                  </div>
                  {i.caption ? (
                    <div style={{ color: '#cbd5e1', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                      {i.caption}
                    </div>
                  ) : null}
                  {i.hashtags?.length ? (
                    <div style={{ color: '#9ca3af', marginTop: 4 }}>
                      {i.hashtags.join(' ')}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => useInCreate(detail, idx)} style={btn}>
                      Use this idea
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {Array.isArray(detail.data?.schedule) && detail.data!.schedule!.length ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#fff', fontWeight: 600 }}>7-Day Schedule</div>
                <ul style={{ marginTop: 8, paddingLeft: 18, color: '#cbd5e1', fontSize: 13 }}>
                  {detail.data!.schedule!.map((s: any, i: number) => {
                    const idea = detail.data!.ideas?.[s.ideaIndex];
                    return <li key={i}><b>{s.day}:</b> {idea?.hook || 'Post'}</li>;
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ----------------- styles (inline objects) -----------------
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#e5e7eb',
    padding: '24px 16px',
    maxWidth: 1120,
    margin: '0 auto',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  } as React.CSSProperties,
  searchRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(24,24,27,0.9)',
    color: '#e5e7eb',
    outline: 'none',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 12,
  } as React.CSSProperties,
  card: {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(24,24,27,0.7)',
    borderRadius: 14,
    padding: 14,
  } as React.CSSProperties,
  small: {
    fontSize: 12,
    color: '#9ca3af',
  } as React.CSSProperties,
  btn: {
    background: '#0ea5e9',
    color: '#fff',
    border: '1px solid #096aa6',
    padding: '8px 10px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  } as React.CSSProperties,
  btnGhost: {
    background: 'rgba(2,6,23,0.3)',
    color: '#e5e7eb',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '8px 10px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  } as React.CSSProperties,
  danger: {
    background: 'rgba(190,18,60,0.15)',
    color: '#fda4af',
    border: '1px solid rgba(244,63,94,0.35)',
    padding: '8px 10px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  pill: {
    fontSize: 11,
    color: '#93c5fd',
    background: 'rgba(14,165,233,0.15)',
    border: '1px solid rgba(14,165,233,0.35)',
    padding: '2px 8px',
    borderRadius: 999,
  } as React.CSSProperties,
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: 'min(520px, 100vw)',
    height: '100%',
    background: '#0b0f13',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    padding: 16,
    overflowY: 'auto' as const,
  },
  idea: {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(24,24,27,0.6)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  } as React.CSSProperties,
  bannerError: {
    border: '1px solid rgba(244,63,94,0.4)',
    background: 'rgba(244,63,94,0.12)',
    color: '#fecaca',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    fontSize: 13,
  } as React.CSSProperties,
};
