'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';

// --- Supabase browser client (public anon) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// --- Types (match the tables we created) ---
type Plan = {
  id: string;
  title: string;
  created_at: string | null;
  due_date: string | null;
  is_archived: boolean;
  user_id: string;
};

type PlanItem = {
  id: string;
  plan_id: string;
  content: string;
  created_at: string | null;
  is_done: boolean;
  order_index: number | null;
  user_id: string;
};

// --- Styles (inline, no Tailwind) ---
const pageWrap: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0b0b0c',
  color: '#fff',
};

const container: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px 16px',
};

const headerRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 16,
};

const h1Style: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: 0.3,
};

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 16,
};

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const input: React.CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  outline: 'none',
};

const smallInput: React.CSSProperties = { ...input, maxWidth: 240 };

const button = (secondary = false): React.CSSProperties => ({
  padding: '10px 14px',
  borderRadius: 10,
  border: secondary ? '1px solid rgba(255,255,255,0.12)' : '1px solid #096aa6',
  background: secondary ? 'rgba(255,255,255,0.06)' : '#0ea5e9',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  opacity: 1,
});

const badge: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 12,
  color: 'rgba(255,255,255,0.75)',
};

const list: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 12,
};

const itemRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(0,0,0,0.2)',
};

const link: React.CSSProperties = {
  color: '#0ea5e9',
  textDecoration: 'underline',
};

// --- Component ---
export default function PlannerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState<string>('');

  // Selected plan
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Items
  const [items, setItems] = useState<PlanItem[]>([]);
  const [newItem, setNewItem] = useState('');

  // --- Auth & initial load ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setUserId(data.user?.id ?? null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadPlans();
  }, [userId]);

  useEffect(() => {
    if (!activePlanId) {
      setItems([]);
      return;
    }
    loadItems(activePlanId);
  }, [activePlanId]);

  const activePlan = useMemo(
    () => plans.find((p) => p.id === activePlanId) ?? null,
    [plans, activePlanId]
  );

  // --- Data ops: Plans ---
  async function loadPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_archived', false)
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      alert(error.message);
      return;
    }
    setPlans(data || []);
    if (!activePlanId && (data?.length ?? 0) > 0) {
      setActivePlanId(data![0].id);
    }
  }

  async function addPlan() {
    if (!newTitle.trim()) return;
    const payload: Partial<Plan> = {
      title: newTitle.trim(),
      due_date: newDue || null,
      is_archived: false,
    };
    const { data, error } = await supabase
      .from('plans')
      .insert(payload)
      .select('*')
      .single();
    if (error) return alert(error.message);
    setPlans((prev) => [data as Plan, ...prev]);
    setNewTitle('');
    setNewDue('');
    setActivePlanId((data as Plan).id);
  }

  async function renamePlan(planId: string, title: string) {
    const { error } = await supabase.from('plans').update({ title }).eq('id', planId);
    if (error) return alert(error.message);
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, title } : p)));
  }

  async function archivePlan(planId: string) {
    const { error } = await supabase.from('plans').update({ is_archived: true }).eq('id', planId);
    if (error) return alert(error.message);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    if (activePlanId === planId) setActivePlanId(null);
  }

  // --- Data ops: Items ---
  async function loadItems(planId: string) {
    const { data, error } = await supabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) {
      alert(error.message);
      return;
    }
    setItems(data || []);
  }

  async function addItem() {
    if (!activePlanId || !newItem.trim()) return;
    const payload: Partial<PlanItem> = {
      plan_id: activePlanId,
      content: newItem.trim(),
      is_done: false,
    };
    const { data, error } = await supabase
      .from('plan_items')
      .insert(payload)
      .select('*')
      .single();
    if (error) return alert(error.message);
    setItems((prev) => [...prev, data as PlanItem]);
    setNewItem('');
  }

  async function toggleItem(item: PlanItem) {
    const { error } = await supabase
      .from('plan_items')
      .update({ is_done: !item.is_done })
      .eq('id', item.id);
    if (error) return alert(error.message);
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, is_done: !it.is_done } : it)));
  }

  async function editItem(itemId: string, content: string) {
    const { error } = await supabase.from('plan_items').update({ content }).eq('id', itemId);
    if (error) return alert(error.message);
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, content } : it)));
  }

  async function deleteItem(itemId: string) {
    const { error } = await supabase.from('plan_items').delete().eq('id', itemId);
    if (error) return alert(error.message);
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  }

  // --- UI ---
  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={container}>
          <div style={{ ...card, textAlign: 'center' }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={pageWrap}>
        <div style={container}>
          <div style={card}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>You’re signed out</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
              Sign in to use your planner.
            </div>
            <Link href="/login" style={link}>Go to login →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={headerRow}>
          <h1 style={h1Style}>Planner</h1>
          <span style={badge}>{plans.length} plans</span>
        </div>

        {/* New plan */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>New plan</div>
          <div style={{ ...row, flexWrap: 'wrap' }}>
            <input
              style={input}
              placeholder="Plan title (e.g., October content grind)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              style={smallInput}
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
            />
            <button style={button()} onClick={addPlan}>Create</button>
          </div>
        </div>

        {/* Plans list */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Your plans</div>
          <div style={list}>
            {plans.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>No plans yet.</div>
            ) : (
              plans.map((p) => (
                <div key={p.id} style={itemRow}>
                  <input
                    style={{ ...input, maxWidth: '100%' }}
                    value={p.title}
                    onChange={(e) => renamePlan(p.id, e.target.value)}
                  />
                  <div style={{ textAlign: 'right', opacity: 0.8, fontSize: 12 }}>
                    {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'No due date'}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={button(true)}
                      onClick={() => setActivePlanId(p.id)}
                      title="Open"
                    >
                      Open
                    </button>
                    <button
                      style={button(true)}
                      onClick={() => archivePlan(p.id)}
                      title="Archive"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active plan panel */}
        {activePlan && (
          <div style={{ ...card }}>
            <div style={{ ...row, justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>
                {activePlan.title}{' '}
                <span style={{ opacity: 0.6, fontWeight: 400 }}>
                  {activePlan.due_date ? `· due ${new Date(activePlan.due_date).toLocaleDateString()}` : ''}
                </span>
              </div>
              <span style={badge}>
                {items.filter((i) => i.is_done).length}/{items.length} done
              </span>
            </div>

            {/* New item */}
            <div style={{ ...row, marginBottom: 12 }}>
              <input
                style={input}
                placeholder="Add a task…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem();
                }}
              />
              <button style={button()} onClick={addItem}>Add</button>
            </div>

            {/* Items list */}
            <div style={list}>
              {items.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                  No items in this plan yet.
                </div>
              ) : (
                items.map((it) => (
                  <div key={it.id} style={itemRow}>
                    <input
                      type="checkbox"
                      checked={it.is_done}
                      onChange={() => toggleItem(it)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <input
                      style={{
                        ...input,
                        textDecoration: it.is_done ? 'line-through' : 'none',
                        opacity: it.is_done ? 0.6 : 1,
                      }}
                      value={it.content}
                      onChange={(e) => editItem(it.id, e.target.value)}
                    />
                    <button style={button(true)} onClick={() => deleteItem(it.id)}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
