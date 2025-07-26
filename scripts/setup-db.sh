#!/bin/bash

# Production deployment script for Render
# This script sets up the database for production

echo "Setting up production database..."

# Generate Prisma client
npx prisma generate

# Push the database schema (creates the database if it doesn't exist)
npx prisma db push --accept-data-loss

# Seed the database with initial data
npx prisma db seed

echo "Database setup complete!"
