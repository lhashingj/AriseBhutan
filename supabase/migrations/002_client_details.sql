-- Migration 002: Add client travel details + payment status to bookings
-- Run this in Supabase SQL Editor after 001_schema.sql

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS nationality     text,
  ADD COLUMN IF NOT EXISTS client_email    text,
  ADD COLUMN IF NOT EXISTS client_phone    text,
  ADD COLUMN IF NOT EXISTS payment_status  text NOT NULL DEFAULT 'UNPAID';

-- Index for fast admin queries filtering by payment status
CREATE INDEX IF NOT EXISTS bookings_payment_status_idx ON public.bookings (payment_status);
