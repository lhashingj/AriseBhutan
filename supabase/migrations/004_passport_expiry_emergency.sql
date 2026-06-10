-- Migration 004: Add passport expiry and emergency contact to bookings
-- Run this in Supabase SQL Editor

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS passport_expiry    text,
  ADD COLUMN IF NOT EXISTS emergency_contact  text;
