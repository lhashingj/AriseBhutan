-- Stores admin-created voucher drafts, one per enquiry
CREATE TABLE IF NOT EXISTS public.vouchers (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id  UUID        NOT NULL UNIQUE,
  form_data   JSONB       NOT NULL DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
