# Supabase setup

This directory contains the production database migration for the KNT application.

Apply migrations in order using the Supabase SQL editor or CLI. Never commit service-role keys or other secrets.

The application uses the public anon key from environment variables and relies on database policies for access control.
