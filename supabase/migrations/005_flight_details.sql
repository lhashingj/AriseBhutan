-- Migration 005: Add structured flight details to bookings
-- Run this in Supabase SQL Editor

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS flight_arrival_no     text,
  ADD COLUMN IF NOT EXISTS flight_arrival_depart text,
  ADD COLUMN IF NOT EXISTS flight_arrival_arrive text,
  ADD COLUMN IF NOT EXISTS flight_return_no      text,
  ADD COLUMN IF NOT EXISTS flight_return_depart  text,
  ADD COLUMN IF NOT EXISTS flight_return_arrive  text;
