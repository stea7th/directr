'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Plan = {
  id: string;
  title: string;
  due_date: string | null; // ISO date
  is_archived: boolean;
  created_at: string;
};

type PlanItem = {
  id: string;
  plan_id: string;
  content: string;
  kind: string;
  is_done: boolean;
  order_index: number;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function PlannerPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [itemsByPlan, setItemsByPlan] = useState<Record<string, PlanItem[]>>({});
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDue, setNewPlanDue] = useState<string>('');
  const [inputs, setInputs] = useState<Record<string, string>>({}); // planId -> input text
  const [busy, setBusy] = useState(false);

  // ensure logged-in (the UI will still render; queries will 401 if not)
  useEffect(() => {
    supabase.auth.getSession().finally(() => setSessionChecked(true));
  }, []);

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('id, title, due_date, is_archived, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }
    setPlans(data ?? []);
  };

  const loadItemsFor = async (planId: string) => {
    const { data, error } = await supabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }
    setItemsByPlan((s) => ({ ...s, [planId]: data ?? [] }));
  };

  const refreshAll = async () => {
    await loadPlans();
  };

  useEffect(() => {
    if (!sessionChecked) return;
    refreshAll();
  }, [sessionChecked]);

  useEffect(() => {
    // load items for newly loaded plans
    plans.forEach((p) => {
      if (!itemsByPlan[p.id]) loadItemsFor(p.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  const createPlan = async () => {
    const title = newPlanTitle.trim();
    if (!title) return;

    setBusy(true);
    const { error } = await supabase.from('plans').insert({
      title,
      due_date: newPlanDue || null,
      // owner is set by trigger
      // data default '{}' by schema
    });
    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }
    setNewPlanTitle('');
    setNewPlanDue('');
    await refreshAll();
  };

  const addItem = async (planId: string) => {
    const text = (inputs[planId] || '').trim();
    if (!text) return;

    const { error } = await supabase.from('plan_items').insert({
      plan_id: planId,
      content: text,
      kind: 'task',        // <- KEY: prevents "kind is null"
      // order_index default 0; you can compute next index if you want
      // owner auto via trigger
    });

    if (error) {
      alert(error.message);
      return;
    }
    setInputs((s) => ({ ...s, [planId]: '' }));
    await loadItemsFor(planId);
  };

  const toggleItem = async (item: PlanItem) => {
    const { error } = await supabase
      .from('plan_items')
      .update({ is_done: !item.is_done })
      .eq('id', item.id);

    if (error) {
      alert(error.message);
      return;
    }
    await loadItemsFor(item.plan_id);
  };

  const archivePlan = async (planId: string) => {
    const { error } = await supabase
      .from('plans')
      .update({ is_archived: true })
      .eq('id', planId);

    if (error) {
      alert(error.message);
      return;
    }
    await refreshAll();
  };

  const openPlans = useMemo(
    () => plans.filter((p) => !p.is_archived),
    [plans]
  );

  return (
    <div style={{ maxWidth: 840, margin: '24px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Planner</h1>

      {/* New Plan */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Plan title (e.g., November content sprint)"
          value={newPlanTitle}
          onChange={(e) => setNewPlanTitle(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff' }}
        />
        <input
          type="date"
          value={newPlanDue}
          onChange={(e) => setNewPlanDue(e.target.value)}
          style={{ width: 160, padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff' }}
        />
        <button
          onClick={createPlan}
          disabled={busy}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #0ea5e9',
            background: '#0ea5e9',
            color: '#fff',
            fontWeight: 600,
            opacity: busy ? 0.7 : 1,
            cursor: 'pointer',
          }}
        >
          Create
        </button>
      </div>

      {/* Plans list */}
      {openPlans.map((p) => {
        const items = itemsByPlan[p.id] || [];
        const done = items.filter((i) => i.is_done).length;

        return (
          <div key={p.id} style={{ border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              <div style={{ opacity: 0.6 }}>· due {p.due_date ?? '—'}</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span style={{ opacity: 0.6 }}>{done}/{items.length} done</span>
                <button
                  onClick={() => archivePlan(p.id)}
                  style={{ border: '1px solid #444', padding: '6px 10px', borderRadius: 8, background: '#181818', color: '#ddd', cursor: 'pointer' }}
                >
                  Archive
                </button>
              </div>
            </div>

            {/* Add item */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="Add a task…"
                value={inputs[p.id] || ''}
                onChange={(e) => setInputs((s) => ({ ...s, [p.id]: e.target.value }))}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff' }}
              />
              <button
                onClick={() => addItem(p.id)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.length === 0 && <div style={{ opacity: 0.6 }}>No items in this plan yet.</div>}
              {items.map((it) => (
                <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={it.is_done}
                    onChange={() => toggleItem(it)}
                  />
                  <span style={{ textDecoration: it.is_done ? 'line-through' : 'none' }}>{it.content}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
